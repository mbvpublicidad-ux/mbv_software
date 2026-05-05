import CompanyBalance from "../../models/CompanyBalance.js";
import Car from "../../models/Car.js";
import ClientPayment from "../../models/ClientPayment.js";
import Expense from "../../models/Expense.js";
import GeneralExpense from "../../models/GeneralExpense.js";
import JCPayment from "../../models/JCPayment.js";
import ExchangeRate from "../../models/ExchangeRate.js";

const companyBalanceResolvers = {
	Query: {
		companyBalance: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne().populate("updatedBy");

			if (!balance) {
				balance = await CompanyBalance.create({
					initialAmountCRC: 0,
					initialAmountUSD: 0,
					currentBalanceCRC: 0,
					currentBalanceUSD: 0,
				});
			}

			return balance;
		},
	},

	Mutation: {
		updateInitialAmountCRC: async (_, { amount }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne();
			if (!balance) {
				balance = await CompanyBalance.create({
					initialAmountCRC: amount,
					currentBalanceCRC: amount,
					initialAmountUSD: 0,
					currentBalanceUSD: 0,
					updatedBy: user._id,
				});
			} else {
				const difference = amount - balance.initialAmountCRC;
				balance.initialAmountCRC = amount;
				balance.currentBalanceCRC += difference;
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return CompanyBalance.findById(balance._id).populate("updatedBy");
		},

		updateInitialAmountUSD: async (_, { amount }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne();
			if (!balance) {
				balance = await CompanyBalance.create({
					initialAmountCRC: 0,
					currentBalanceCRC: 0,
					initialAmountUSD: amount,
					currentBalanceUSD: amount,
					updatedBy: user._id,
				});
			} else {
				const difference = amount - balance.initialAmountUSD;
				balance.initialAmountUSD = amount;
				balance.currentBalanceUSD += difference;
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

			const rateDoc = await ExchangeRate.findOne().sort({ updateDate: -1 });
			const exchangeRate = rateDoc?.value || 0;

			// Ventas (siempre CRC)
			const soldCars = await Car.find({ availability: "Sold" });
			const totalSales = soldCars.reduce(
				(sum, c) => sum + (c.finalSalePriceCRC || 0),
				0,
			);

			// Pagos de clientes
			const clientPayments = await ClientPayment.find({});
			let totalClientPaymentsCRC = 0;
			let totalClientPaymentsUSD = 0;
			for (const p of clientPayments) {
				if (p.currency === "USD") {
					totalClientPaymentsUSD += p.amount;
				} else {
					totalClientPaymentsCRC += p.amount;
				}
			}

			// Gastos no-JC
			const expenses = await Expense.find({ isFromJuanCarlos: false });
			let totalExpensesCRC = 0;
			let totalExpensesUSD = 0;
			for (const exp of expenses) {
				if (exp.currency === "CRC") {
					totalExpensesCRC += exp.amount;
				} else {
					totalExpensesUSD += exp.amount;
				}
			}

			// Gastos generales
			const generalExpenses = await GeneralExpense.find({});
			let totalGeneralCRC = 0;
			let totalGeneralUSD = 0;
			for (const exp of generalExpenses) {
				if (exp.currency === "CRC") {
					totalGeneralCRC += exp.amount;
				} else {
					totalGeneralUSD += exp.amount;
				}
			}

			// Pagos a JC (siempre USD)
			const jcPayments = await JCPayment.find({});
			const totalJCPaymentsUSD = jcPayments.reduce(
				(sum, p) => sum + p.amount,
				0,
			);

			balance.currentBalanceCRC =
				balance.initialAmountCRC +
				totalSales +
				totalClientPaymentsCRC -
				totalExpensesCRC -
				totalGeneralCRC;
			balance.currentBalanceUSD =
				balance.initialAmountUSD +
				totalClientPaymentsUSD -
				totalExpensesUSD -
				totalGeneralUSD -
				totalJCPaymentsUSD;
			balance.lastUpdated = new Date();
			balance.updatedBy = user._id;
			await balance.save();

			return CompanyBalance.findById(balance._id).populate("updatedBy");
		},
	},
};

export default companyBalanceResolvers;
