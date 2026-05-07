import mongoose from "mongoose";

const generalIncomeSchema = new mongoose.Schema({
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
	currency: {
		type: String,
		required: [true, "La moneda es requerida"],
		enum: ["USD", "CRC"],
	},
	incomeDate: {
		type: Date,
		required: [true, "La fecha es requerida"],
	},
	description: {
		type: String,
		trim: true,
	},
	receipt: {
		type: String,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const GeneralIncome = mongoose.model("GeneralIncome", generalIncomeSchema);
export default GeneralIncome;
