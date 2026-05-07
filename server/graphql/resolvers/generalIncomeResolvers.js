import GeneralIncome from "../../models/GeneralIncome.js";
import CompanyBalance from "../../models/CompanyBalance.js";

const generalIncomeResolvers = {
	Query: {
		generalIncomes: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return GeneralIncome.find()
				.populate("createdBy")
				.sort({ incomeDate: -1 });
		},
		generalIncome: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return GeneralIncome.findById(id).populate("createdBy");
		},
	},
	Mutation: {
		createGeneralIncome: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			const income = await GeneralIncome.create({
				...input,
				createdBy: user._id,
			});

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

			return GeneralIncome.findById(income._id).populate("createdBy");
		},
		updateGeneralIncome: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			const income = await GeneralIncome.findById(id);
			if (!income) throw new Error("Income not found");

			const balance = await CompanyBalance.findOne();
			if (balance) {
				// Revertir anterior
				if (income.currency === "USD") {
					balance.currentBalanceUSD -= income.amount;
				} else {
					balance.currentBalanceCRC -= income.amount;
				}
				// Aplicar nuevo
				const newAmount = input.amount || income.amount;
				const newCurrency = input.currency || income.currency;
				if (newCurrency === "USD") {
					balance.currentBalanceUSD += newAmount;
				} else {
					balance.currentBalanceCRC += newAmount;
				}
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return GeneralIncome.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true },
			).populate("createdBy");
		},
		deleteGeneralIncome: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			const income = await GeneralIncome.findById(id);
			if (!income) throw new Error("Income not found");

			const balance = await CompanyBalance.findOne();
			if (balance) {
				if (income.currency === "USD") {
					balance.currentBalanceUSD -= income.amount;
				} else {
					balance.currentBalanceCRC -= income.amount;
				}
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			await GeneralIncome.findByIdAndDelete(id);
			return true;
		},
	},
	GeneralIncome: {
		incomeDate: (income) => income.incomeDate?.toISOString?.() ?? null,
	},
};

export default generalIncomeResolvers;
