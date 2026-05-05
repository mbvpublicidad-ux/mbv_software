import "dotenv/config";
import mongoose from "mongoose";
import CompanyBalance from "../models/CompanyBalance.js";
import Expense from "../models/Expense.js";
import GeneralExpense from "../models/GeneralExpense.js";
import ClientPayment from "../models/ClientPayment.js";

const migrateBalances = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB\n");

		// 1. Migrar CompanyBalance
		const balance = await CompanyBalance.findOne();
		if (balance) {
			// Si ya tiene los campos nuevos, saltar
			if (balance.currentBalanceCRC !== undefined) {
				console.log("CompanyBalance already migrated, skipping...");
			} else {
				const oldInitial = balance.initialAmount || 0;
				const oldCurrent = balance.currentBalance || 0;

				balance.initialAmountCRC = oldInitial;
				balance.initialAmountUSD = 0;
				balance.currentBalanceCRC = oldCurrent;
				balance.currentBalanceUSD = 0;
				balance.initialAmount = undefined;
				balance.currentBalance = undefined;
				await balance.save();
				console.log("✅ CompanyBalance migrated");
			}
		}

		// 2. Migrar Expenses
		const expenses = await Expense.updateMany(
			{ paidFrom: null },
			{ $set: { paidFrom: "USD" } }, // No hay forma de copiar el valor dinámicamente sin pipeline
		);
		// Luego corregir los que son CRC
		await Expense.updateMany(
			{ paidFrom: "USD", currency: "CRC" },
			{ $set: { paidFrom: "CRC" } },
		);
		console.log(`✅ Expenses migrated`);

		// 3. Migrar GeneralExpenses
		await GeneralExpense.updateMany(
			{ paidFrom: null },
			{ $set: { paidFrom: "USD" } },
		);
		await GeneralExpense.updateMany(
			{ paidFrom: "USD", currency: "CRC" },
			{ $set: { paidFrom: "CRC" } },
		);
		console.log(`✅ General expenses migrated`);

		// 4. Migrar ClientPayments
		const clientPayments = await ClientPayment.updateMany(
			{ currency: { $exists: false } },
			{ $set: { currency: "CRC" } },
		);
		console.log(`✅ ${clientPayments.modifiedCount} client payments migrated`);

		console.log("\n--- Migration Complete ---");
		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
};

migrateBalances();
