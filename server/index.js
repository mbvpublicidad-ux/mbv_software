import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/User.js";
import cookieParser from "cookie-parser";
import cloudinary from "./config/cloudinary.js";
import mongodbConnection from "./config/mongodb.js";
import createApolloServer from "./config/apolloServer.js";
import { expressMiddleware } from "@as-integrations/express5";

import {
	deleteImage,
	extractPublicId,
	createSignature,
} from "./config/cloudinary.js";

import { clearRefreshTokenCookieOptions } from "./config/cookieConfig.js";

const app = express();
const httpServer = http.createServer(app);
const serverPort = process.env.SERVER_PORT || 4000;

if (!process.env.MONGO_URI) {
	console.error("DB Uri is not defined");
	process.exit(1);
}

const whitelist = [
	"http://localhost:5173",
	"http://localhost:4000",
	"http://localhost:4000/graphql",
	"https://importacionesmbv.com",
	"https://www.importacionesmbv.com",
];

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (whitelist.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Dominio no autorizado por CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const ALLOWED_TYPES = [
	"image/webp",
	"image/png",
	"image/jpg",
	"image/jpeg",
	"image/avif",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

app.post("/api/cloudinary-signature", async (req, res) => {
	try {
		const { fileType, fileSize, folder = "vehicles" } = req.body;

		if (!ALLOWED_TYPES.includes(fileType)) {
			return res.status(400).json({
				error: "Tipo de archivo no permitido. Solo WebP, PNG, JPG o AVIF",
			});
		}

		if (fileSize > MAX_SIZE_BYTES) {
			return res.status(400).json({
				error: "El archivo supera el límite de 5MB",
			});
		}

		const timestamp = Math.round(new Date().getTime() / 1000);

		const paramsToSign = {
			timestamp,
			folder: `mbv/${folder}`,
			// Transformaciones eager para optimizar: múltiples tamaños
			eager:
				"w_1200,q_auto:best,f_auto|w_800,q_auto:good,f_auto|w_400,q_auto:good,f_auto",
			eager_async: true,
		};

		const signature = cloudinary.utils.api_sign_request(
			paramsToSign,
			process.env.CLOUD_SECRET,
		);

		res.json({
			signature,
			timestamp,
			cloudName: process.env.CLOUD_NAME,
			apiKey: process.env.CLOUD_KEY,
			folder: paramsToSign.folder,
			eager: paramsToSign.eager,
			eager_async: true,
		});
	} catch (error) {
		console.error("Error generating signature:", error);
		res.status(500).json({ error: "Failed to generate signature" });
	}
});

// Eliminar imagen individual
app.post("/api/cloudinary-delete", async (req, res) => {
	try {
		const { url } = req.body;
		const publicId = extractPublicId(url);
		if (!publicId) return res.status(400).json({ error: "Invalid URL" });
		await deleteImage(publicId);
		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting image:", error);
		res.status(500).json({ error: "Failed to delete image" });
	}
});

// Refresh token endpoint
app.post("/api/refresh-token", async (req, res) => {
	const token = req.cookies?.refreshToken;

	if (!token) return res.status(401).json({ error: "No refresh token" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
		const user = await User.findById(decoded.id);
		if (!user) {
			res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
			return res.status(401).json({ error: "Unauthorized" });
		}

		const accessToken = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "10m" },
		);

		res.json({ token: accessToken });
	} catch {
		res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
		res.status(401).json({ error: "Invalid refresh token" });
	}
});

// Health check
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

// Iniciar servidor
(async () => {
	try {
		await mongodbConnection();
		const server = await createApolloServer();

		app.use(
			"/graphql",
			expressMiddleware(server, {
				context: async ({ req, res }) => {
					const token = req.headers.authorization || "";

					if (token) {
						try {
							const decodedToken = jwt.verify(
								token.replace("Bearer ", ""),
								process.env.JWT_SECRET,
							);
							const user = await User.findById(decodedToken.id);
							if (!user) throw new Error("User not found");
							return { user, res };
						} catch (error) {
							if (error.name === "TokenExpiredError") {
								throw new GraphQLError("Token expired", {
									extensions: { code: "UNAUTHENTICATED" },
								});
							}
							return { user: null, res };
						}
					}
					return { user: null, res };
				},
			}),
		);

		await new Promise((resolve) => {
			httpServer.listen({ port: serverPort }, resolve);
		});

		console.log(`🚀 Server running on port: ${serverPort}`);
		console.log(`📍 GraphQL endpoint: http://localhost:${serverPort}/graphql`);
	} catch (error) {
		console.error("Error starting server:", error.message);
		process.exit(1);
	}
})();

process.on("SIGINT", async () => {
	console.log("Shutting down gracefully...");
	await mongoose.connection.close();
	process.exit(0);
});
