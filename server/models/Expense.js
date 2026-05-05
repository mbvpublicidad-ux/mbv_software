import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
	car: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Car",
		required: [true, "El auto es requerido"],
	},
	type: {
		type: String,
		required: [true, "El tipo de gasto es requerido"],
		enum: [
			"Car purchase",
			"Inspection",
			"Tow truck",
			"Mileage adjustment in USA",
			"Mileage adjustment in CR",
			"Taxes",
			"Warehouse",
			"VAT",
			"Seller commission",
			"Car registration",
			"Fuel",
			"Spare parts",
			"Repairs",
			"Shipping line",
			"Other Juan Carlos expenses",
			"Other expenses",
		],
	},
	description: {
		type: String,
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
	isFromJuanCarlos: {
		type: Boolean,
		required: [true, "Debe especificar si es un gasto de Juan Carlos"],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
