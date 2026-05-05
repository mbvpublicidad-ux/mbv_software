import mongoose from "mongoose";

const generalExpenseSchema = new mongoose.Schema({
	concept: {
		type: String,
		required: [true, "El concepto es requerido"],
		trim: true,
	},
	amount: {
		type: Number,
		required: [true, "El monto es requerido"],
		min: 0,
	},
	paidFrom: {
		type: String,
		enum: ["CRC", "USD", null],
		default: null,
	},
	currency: {
		type: String,
		required: [true, "La moneda es requerida"],
		enum: ["USD", "CRC"],
	},
	expenseDate: {
		type: Date,
		required: [true, "La fecha del gasto es requerida"],
	},
	receipt: {
		type: String,
	},
	description: {
		type: String,
		trim: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const GeneralExpense = mongoose.model("GeneralExpense", generalExpenseSchema);

export default GeneralExpense;
