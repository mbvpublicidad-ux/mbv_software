import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema({
	value: {
		type: Number,
		required: [true, "El valor del tipo de cambio es requerido"],
		min: 0,
	},
	updateDate: {
		type: Date,
		default: Date.now,
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);

export default ExchangeRate;
