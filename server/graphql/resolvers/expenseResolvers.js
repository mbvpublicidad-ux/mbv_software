import CompanyBalance from "../../models/CompanyBalance.js";
import Expense from "../../models/Expense.js";
import Car from "../../models/Car.js";
import { processBalanceUpdate } from "../../utils/currencyConverter.js";

const expenseResolvers = {
	Query: {
		expenses: async (
			_,
			{ carId, isFromJuanCarlos, type, page, limit },
			{ user },
		) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const query = {};
			if (carId) query.car = carId;
			if (isFromJuanCarlos !== undefined)
				query.isFromJuanCarlos = isFromJuanCarlos;
			if (type) query.type = type;

			let expensesQuery = Expense.find(query)
				.populate({
					path: "car",
					populate: {
						path: "brand",
					},
				})
				.populate({
					path: "car",
					populate: {
						path: "carModel",
					},
				})
				.sort({ expenseDate: -1 });

			if (page && limit) {
				expensesQuery = expensesQuery.skip((page - 1) * limit).limit(limit);
			}

			return expensesQuery;
		},

		expense: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			return Expense.findById(id).populate("car");
		},

		carExpensesSummary: async (_, { carId }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expenses = await Expense.find({ car: carId });

			let totalUSD = 0;
			let totalCRC = 0;

			for (const expense of expenses) {
				if (expense.currency === "USD") {
					totalUSD += expense.amount;
				} else {
					totalCRC += expense.amount;
				}
			}

			return {
				totalUSD,
				totalCRC,
				expenses,
			};
		},
	},

	Mutation: {
		createExpense: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(input.car);
			if (!car) throw new Error("Car not found");

			const expense = await Expense.create(input);

			// Add expense to car's expenses array
			await Car.findByIdAndUpdate(input.car, {
				$addToSet: { expenses: expense._id },
			});

			// Update CompanyBalance if it's a non-JC expense
			if (!input.isFromJuanCarlos) {
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

					// Guardar en el expense
					expense.convertedAmount = convertedAmount;
					expense.exchangeRateUsed = exchangeRateUsed;
					await expense.save();
				}
			}

			return Expense.findById(expense._id).populate({
				path: "car",
				populate: [{ path: "brand" }, { path: "carModel" }],
			});
		},

		updateExpense: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await Expense.findById(id);
			if (!expense) throw new Error("Expense not found");

			const car = await Car.findById(expense.car);

			if (input.receipt === "" || input.receipt === undefined) {
				input.receipt = null;
			}

			if (!expense.isFromJuanCarlos) {
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
					const { convertedAmount, exchangeRateUsed } =
						await processBalanceUpdate(
							balance,
							input.amount || expense.amount,
							input.currency || expense.currency,
							input.paidFrom !== undefined ? input.paidFrom : expense.paidFrom,
						);
					balance.lastUpdated = new Date();
					balance.updatedBy = user._id;
					await balance.save();

					expense.convertedAmount = convertedAmount;
					expense.exchangeRateUsed = exchangeRateUsed;
				}
			}

			const updatedExpense = await Expense.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			).populate({
				path: "car",
				populate: [{ path: "brand" }, { path: "carModel" }],
			});

			return updatedExpense;
		},

		deleteExpense: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await Expense.findById(id);
			if (!expense) throw new Error("Expense not found");

			const car = await Car.findById(expense.car);

			// Remove expense reference from car
			if (car) {
				await Car.findByIdAndUpdate(car._id, {
					$pull: { expenses: id },
				});
			}

			// Reembolsar al balance si es gasto no-JC
			if (!expense.isFromJuanCarlos) {
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
			}

			await Expense.findByIdAndDelete(id);
			return true;
		},
	},

	Expense: {
		expenseDate: (expense) => {
			return expense.expenseDate?.toISOString?.() ?? null;
		},
		createdAt: (expense) => {
			return expense.createdAt?.toISOString?.() ?? null;
		},
	},
};

export default expenseResolvers;
