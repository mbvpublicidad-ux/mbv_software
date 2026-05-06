import mongoose from "mongoose";

const carEstimateSchema = new mongoose.Schema({
	car: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Car",
		required: true,
		unique: true,
	},
	estimatedTaxes: { type: Number, default: 0 },
	estimatedVAT: { type: Number, default: 0 },
	estimatedRegistration: { type: Number, default: 0 },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	updatedAt: { type: Date, default: Date.now },
});

const CarEstimate = mongoose.model("CarEstimate", carEstimateSchema);
export default CarEstimate;
