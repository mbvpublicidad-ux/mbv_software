import "dotenv/config";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import GeneralExpense from "../models/GeneralExpense.js";

const migrateConvertedAmounts = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB\n");

		// Obtener todos y actualizar uno por uno
		const expenses = await Expense.find({
			convertedAmount: { $exists: false },
		});
		for (const exp of expenses) {
			exp.convertedAmount = exp.amount;
			await exp.save();
		}
		console.log(`✅ ${expenses.length} expenses migrated`);

		const generalExpenses = await GeneralExpense.find({
			convertedAmount: { $exists: false },
		});
		for (const ge of generalExpenses) {
			ge.convertedAmount = ge.amount;
			await ge.save();
		}
		console.log(`✅ ${generalExpenses.length} general expenses migrated`);

		console.log("\n--- Migration Complete ---");
		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
};

migrateConvertedAmounts();
