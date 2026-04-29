import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../models/User.js";
import Car from "../../models/Car.js";

import { sendResetPasswordEmail } from "../../config/nodemailer.js";

const userResolvers = {
	Query: {
		me: async (_, __, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");
			return User.findById(user._id).populate("commissionedCars");
		},

		users: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return User.find({}).populate("commissionedCars");
		},

		user: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return User.findById(id).populate("commissionedCars");
		},

		clients: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return User.find({ role: "client" }).populate({
				path: "commissionedCars",
				populate: [{ path: "brand" }, { path: "carModel" }],
			});
		},
	},

	Mutation: {
		login: async (_, { email, password }, { res }) => {
			const user = await User.findOne({ email, active: true });
			if (!user) throw new Error("Invalid credentials");

			const isValid = await user.comparePassword(password);
			if (!isValid) throw new Error("Invalid credentials");

			const token = jwt.sign(
				{ id: user._id, role: user.role },
				process.env.JWT_SECRET,
				{ expiresIn: "10m" },
			);

			const refreshToken = jwt.sign(
				{ id: user._id },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: "7d" },
			);

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
				path: "/",
			});

			return { token, user };
		},

		logout: async (_, __, { res }) => {
			res.clearCookie("refreshToken");
			return true;
		},

		register: async (_, { input }, { res }) => {
			const existingUser = await User.findOne({ email: input.email });
			if (existingUser) throw new Error("Email already exists");

			const user = await User.create({
				...input,
				role: "client",
			});

			const token = jwt.sign(
				{ id: user._id, role: user.role },
				process.env.JWT_SECRET,
				{ expiresIn: "10m" },
			);

			const refreshToken = jwt.sign(
				{ id: user._id },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: "7d" },
			);

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
				path: "/",
			});

			return { token, user };
		},

		createUser: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const existingUser = await User.findOne({ email: input.email });
			if (existingUser) throw new Error("Email already exists");

			const temporaryPassword =
				input.password || crypto.randomBytes(4).toString("hex");

			return User.create({
				...input,
				password: temporaryPassword,
				temporaryPassword: !input.password,
			});
		},

		updateUser: async (_, { id, input }, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");

			// Only superadmin can update other admins
			if (user.role !== "superadmin" && user._id.toString() !== id) {
				const targetUser = await User.findById(id);
				if (targetUser && targetUser.role !== "client") {
					throw new Error("Not authorized");
				}
			}

			const updatedUser = await User.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			).populate("commissionedCars");

			if (!updatedUser) throw new Error("User not found");
			return updatedUser;
		},

		deleteUser: async (_, { id }, { user }) => {
			if (!user || user.role !== "superadmin") {
				throw new Error("Not authorized");
			}

			const targetUser = await User.findById(id);
			if (!targetUser) throw new Error("User not found");

			if (targetUser.role === "superadmin") {
				throw new Error("Cannot delete superadmin");
			}

			// Remove this user from any assigned cars
			await Car.updateMany(
				{ assignedClient: id },
				{ $set: { assignedClient: null, owner: "MBV" } },
			);

			await User.findByIdAndDelete(id);
			return true;
		},

		changePassword: async (_, { input }, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");

			const currentUser = await User.findById(user._id);
			if (!currentUser) throw new Error("User not found");

			const isValid = await currentUser.comparePassword(input.currentPassword);
			if (!isValid) throw new Error("Current password is incorrect");

			currentUser.password = input.newPassword;
			currentUser.temporaryPassword = false;
			await currentUser.save();

			return true;
		},

		forgotPassword: async (_, { email }) => {
			const user = await User.findOne({ email });
			if (!user) return true; // Don't reveal if email exists

			const code = crypto.randomInt(100000, 999999).toString();

			await User.findByIdAndUpdate(user._id, {
				resetPasswordCode: code,
				resetPasswordExpires: Date.now() + 3600000, // 1 hour
			});

			await sendResetPasswordEmail(email, code);
			return true;
		},

		resetPassword: async (_, { input }) => {
			const user = await User.findOne({
				email: input.email,
				resetPasswordCode: input.code,
				resetPasswordExpires: { $gt: Date.now() },
			});

			if (!user) throw new Error("Invalid or expired code");

			user.password = input.newPassword;
			user.resetPasswordCode = undefined;
			user.resetPasswordExpires = undefined;
			user.temporaryPassword = false;
			await user.save();

			return true;
		},

		assignCarToClient: async (_, { userId, carId }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const client = await User.findById(userId);
			if (!client || client.role !== "client")
				throw new Error("Invalid client");

			const car = await Car.findById(carId);
			if (!car) throw new Error("Car not found");

			car.owner = "Client";
			car.assignedClient = userId;
			car.availability = "Reserved";
			await car.save();

			if (!client.commissionedCars.includes(carId)) {
				client.commissionedCars.push(carId);
				await client.save();
			}

			return User.findById(userId).populate({
				path: "commissionedCars",
				populate: [{ path: "brand" }, { path: "carModel" }],
			});
		},

		removeCarFromClient: async (_, { userId, carId }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const client = await User.findById(userId);
			if (!client) throw new Error("Client not found");

			const car = await Car.findById(carId);
			if (car) {
				car.owner = "MBV";
				car.assignedClient = null;
				car.availability = "Available";
				await car.save();
			}

			client.commissionedCars = client.commissionedCars.filter(
				(c) => c.toString() !== carId,
			);
			await client.save();

			return User.findById(userId).populate("commissionedCars");
		},
	},

	User: {
		registrationDate: (user) => {
			return user.registrationDate?.toISOString?.() ?? null;
		},
	},
};

export default userResolvers;
