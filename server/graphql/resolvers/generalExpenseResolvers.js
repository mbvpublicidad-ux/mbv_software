import GeneralExpense from "../../models/GeneralExpense.js";
import CompanyBalance from "../../models/CompanyBalance.js";
import { processBalanceUpdate } from "../../utils/currencyConverter.js";

const generalExpenseResolvers = {
	Query: {
		generalExpenses: async (
			_,
			{ page, limit, startDate, endDate },
			{ user },
		) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const query = {};
			if (startDate || endDate) {
				query.expenseDate = {};
				if (startDate) query.expenseDate.$gte = new Date(startDate);
				if (endDate) query.expenseDate.$lte = new Date(endDate);
			}

			let expensesQuery = GeneralExpense.find(query).sort({ expenseDate: -1 });

			if (page && limit) {
				expensesQuery = expensesQuery.skip((page - 1) * limit).limit(limit);
			}

			return expensesQuery;
		},

		generalExpense: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			return GeneralExpense.findById(id);
		},
	},

	Mutation: {
		createGeneralExpense: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await GeneralExpense.create(input);

			// Update CompanyBalance - reduce balance
			const balance = await CompanyBalance.findOne();
			if (balance) {
				const { convertedAmount, exchangeRateUsed } =
					await processBalanceUpdate(
						balance,
						input.amount,
						input.currency,
						input.paidFrom,
					);
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();

				expense.convertedAmount = convertedAmount;
				expense.exchangeRateUsed = exchangeRateUsed;
				await expense.save();
			}

			return expense;
		},

		updateGeneralExpense: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await GeneralExpense.findById(id);
			if (!expense) throw new Error("General expense not found");

			if (input.receipt === "" || input.receipt === undefined) {
				input.receipt = null;
			}

			const balance = await CompanyBalance.findOne();
			if (balance) {
				// Revertir
				await processBalanceUpdate(
					balance,
					expense.amount,
					expense.currency,
					expense.paidFrom,
					true,
				);
				// Aplicar nuevo
				const newAmount = input.amount || expense.amount;
				const newCurrency = input.currency || expense.currency;
				const newPaidFrom =
					input.paidFrom !== undefined ? input.paidFrom : expense.paidFrom;

				const { convertedAmount, exchangeRateUsed } =
					await processBalanceUpdate(
						balance,
						newAmount,
						newCurrency,
						newPaidFrom,
					);
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();

				input.convertedAmount = convertedAmount;
				input.exchangeRateUsed = exchangeRateUsed;
			}

			const updatedExpense = await GeneralExpense.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			);

			if (!updatedExpense) throw new Error("General expense not found");
			return updatedExpense;
		},

		deleteGeneralExpense: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await GeneralExpense.findById(id);
			if (!expense) throw new Error("Expense not found");

			// Reembolsar al balance
			const balance = await CompanyBalance.findOne();
			if (balance) {
				await processBalanceUpdate(
					balance,
					expense.amount,
					expense.currency,
					expense.paidFrom,
					true,
				);
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			await GeneralExpense.findByIdAndDelete(id);
			return true;
		},
	},

	GeneralExpense: {
		expenseDate: (expense) => {
			return expense.expenseDate?.toISOString?.() ?? null;
		},
		createdAt: (expense) => {
			return expense.createdAt?.toISOString?.() ?? null;
		},
	},
};

export default generalExpenseResolvers;
