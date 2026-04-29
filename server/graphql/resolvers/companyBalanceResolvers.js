import Car from "../../models/Car.js";
import ClientPayment from "../../models/ClientPayment.js";
import Expense from "../../models/Expense.js";
import ExchangeRate from "../../models/ExchangeRate.js";
import GeneralExpense from "../../models/GeneralExpense.js";
import JCPayment from "../../models/JCPayment.js";
import CompanyBalance from "../../models/CompanyBalance.js";

const companyBalanceResolvers = {
	Query: {
		companyBalance: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne().populate("updatedBy");

			if (!balance) {
				// Create initial balance if it doesn't exist
				balance = await CompanyBalance.create({
					initialAmount: 0,
					currentBalance: 0,
				});
			}

			return balance;
		},
	},

	Mutation: {
		updateInitialAmount: async (_, { amount }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne();

			if (!balance) {
				balance = await CompanyBalance.create({
					initialAmount: amount,
					currentBalance: amount,
					updatedBy: user._id,
				});
			} else {
				// Adjust current balance proportionally
				const difference = amount - balance.initialAmount;
				balance.initialAmount = amount;
				balance.currentBalance += difference;
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return CompanyBalance.findById(balance._id).populate("updatedBy");
		},
		recalculateBalance: async (_, __, { user }) => {
			if (!user || user.role !== "superadmin") {
				throw new Error("Not authorized");
			}

			const balance = await CompanyBalance.findOne();
			if (!balance) throw new Error("No balance found");

			// Ventas
			const soldCars = await Car.find({ availability: "Sold" });
			const totalSales = soldCars.reduce(
				(sum, c) => sum + (c.finalSalePriceCRC || 0),
				0,
			);

			// Pagos de clientes
			const clientPayments = await ClientPayment.find({});
			const totalClientPayments = clientPayments.reduce(
				(sum, p) => sum + p.amount,
				0,
			);

			// Gastos no-JC
			const expenses = await Expense.find({ isFromJuanCarlos: false });
			const rateDoc = await ExchangeRate.findOne().sort({ updateDate: -1 });
			const exchangeRate = rateDoc?.value || 0;

			let totalExpensesCRC = 0;
			for (const exp of expenses) {
				if (exp.currency === "CRC") totalExpensesCRC += exp.amount;
				else totalExpensesCRC += exp.amount * exchangeRate;
			}

			// Gastos generales
			const generalExpenses = await GeneralExpense.find({});
			let totalGeneralCRC = 0;
			for (const exp of generalExpenses) {
				if (exp.currency === "CRC") totalGeneralCRC += exp.amount;
				else totalGeneralCRC += exp.amount * exchangeRate;
			}

			// Pagos a JC
			const jcPayments = await JCPayment.find({});
			const totalJCPaymentsUSD = jcPayments.reduce(
				(sum, p) => sum + p.amount,
				0,
			);

			balance.currentBalance =
				balance.initialAmount +
				totalSales +
				totalClientPayments -
				totalExpensesCRC -
				totalGeneralCRC -
				totalJCPaymentsUSD * exchangeRate;
			balance.lastUpdated = new Date();
			balance.updatedBy = user._id;
			await balance.save();

			return CompanyBalance.findById(balance._id).populate("updatedBy");
		},
	},
};

export default companyBalanceResolvers;
