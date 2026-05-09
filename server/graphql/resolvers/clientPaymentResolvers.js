import Car from "../../models/Car.js";
import User from "../../models/User.js";
import ClientPayment from "../../models/ClientPayment.js";
import CompanyBalance from "../../models/CompanyBalance.js";

// import { notifyClientPayment } from "../../config/whatsapp.js";

const clientPaymentResolvers = {
	Query: {
		clientPayments: async (_, { clientId, carId, page, limit }, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");

			const query = {};

			// If client, can only see their own payments
			if (user.role === "client") {
				query.client = user._id;
			} else if (user.role === "admin" || user.role === "superadmin") {
				if (clientId) query.client = clientId;
				if (carId) query.car = carId;
			} else {
				throw new Error("Not authorized");
			}

			let paymentsQuery = ClientPayment.find(query)
				.populate("client")
				.populate({
					path: "car",
					populate: [{ path: "brand" }, { path: "carModel" }],
				})
				.populate("createdBy")
				.sort({ paymentDate: -1 });

			if (page && limit) {
				paymentsQuery = paymentsQuery.skip((page - 1) * limit).limit(limit);
			}

			return paymentsQuery;
		},

		clientPayment: async (_, { id }, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");

			const payment = await ClientPayment.findById(id)
				.populate("client")
				.populate("car")
				.populate("createdBy");

			if (!payment) throw new Error("Payment not found");

			// Clients can only see their own payments
			if (
				user.role === "client" &&
				payment.client._id.toString() !== user._id.toString()
			) {
				throw new Error("Not authorized");
			}

			return payment;
		},
	},

	Mutation: {
		createClientPayment: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const client = await User.findById(input.client);
			if (!client || client.role !== "client") {
				throw new Error("Invalid client");
			}

			const car = await Car.findById(input.car);
			if (!car) throw new Error("Car not found");

			const payment = await ClientPayment.create({
				...input,
				createdBy: user._id,
			});

			const allPayments = await ClientPayment.find({ car: input.car });
			const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

			// Update CompanyBalance - increase balance (client payment received)
			const balance = await CompanyBalance.findOne();

			if (balance) {
				if (input.currency === "USD") {
					balance.currentBalanceUSD += input.amount;
				} else {
					balance.currentBalanceCRC += input.amount;
				}
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			if (totalPaid >= car.publishedPriceCRC && car.availability !== "Sold") {
				// Eliminar imágenes de Cloudinary
				if (car.images && car.images.length > 0) {
					const { deleteImages } = await import("../../config/cloudinary.js");
					await deleteImages(car.images);
				}

				car.availability = "Sold";
				car.finalSalePriceCRC = totalPaid;
				car.saleDate = new Date().toISOString();
				car.images = [];
				await car.save();
			}

			// const updatedPayment = await ClientPayment.findById(payment._id)
			// 	.populate("client")
			// 	.populate({
			// 		path: "car",
			// 		populate: [{ path: "brand" }, { path: "carModel" }],
			// 	});

			// // Notificar al cliente por WhatsApp
			// if (client.phone) {
			// 	const pendingBalance = Math.max(0, car.publishedPriceCRC - totalPaid);

			// 	// Obtener datos poblados del auto
			// 	const carPopulated = await Car.findById(input.car)
			// 		.populate("brand")
			// 		.populate("carModel");

			// 	notifyClientPayment(
			// 		client,
			// 		carPopulated,
			// 		input.amount,
			// 		pendingBalance,
			// 	).catch((err) => console.error("WhatsApp notification failed:", err));
			// }

			return ClientPayment.findById(payment._id)
				.populate("client")
				.populate({
					path: "car",
					populate: [{ path: "brand" }, { path: "carModel" }],
				})
				.populate("createdBy");
		},

		updateClientPayment: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			if (input.receipt === "" || input.receipt === undefined) {
				input.receipt = null;
			}

			const balance = await CompanyBalance.findOne();
			if (balance) {
				const payment = await ClientPayment.findById(id);
				if (!payment) throw new Error("Payment not found");

				// Revertir el pago anterior
				if (payment.currency === "USD") {
					balance.currentBalanceUSD -= payment.amount;
				} else {
					balance.currentBalanceCRC -= payment.amount;
				}

				// Aplicar el nuevo pago
				const newAmount = input.amount || payment.amount;
				const newCurrency = input.currency || payment.currency;
				if (newCurrency === "USD") {
					balance.currentBalanceUSD += newAmount;
				} else {
					balance.currentBalanceCRC += newAmount;
				}

				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			const updatedPayment = await ClientPayment.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			)
				.populate("client")
				.populate("car")
				.populate("createdBy");

			if (!updatedPayment) throw new Error("Payment not found");
			return updatedPayment;
		},

		deleteClientPayment: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const payment = await ClientPayment.findById(id);
			if (!payment) throw new Error("Payment not found");

			await ClientPayment.findByIdAndDelete(id);

			// Descontar del balance
			const balance = await CompanyBalance.findOne();
			if (balance) {
				if (payment.currency === "USD") {
					balance.currentBalanceUSD -= payment.amount;
				} else {
					balance.currentBalanceCRC -= payment.amount;
				}
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return true;
		},
	},

	ClientPayment: {
		paymentDate: (clientPayment) =>
			clientPayment.paymentDate?.toISOString?.() || null,
		pendingBalance: async (payment) => {
			const car = await Car.findById(payment.car);
			if (!car) return 0;

			// Sumar todos los pagos de este auto
			const allPayments = await ClientPayment.find({ car: payment.car });
			const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

			return Math.max(0, car.publishedPriceCRC - totalPaid);
		},
	},
};

export default clientPaymentResolvers;
