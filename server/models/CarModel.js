import mongoose from "mongoose";

const carModelSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "El nombre del modelo es requerido"],
			trim: true,
			uppercase: true,
		},
		brand: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brand",
			required: [true, "La marca es requerida"],
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

// Compound index to prevent duplicate model names within the same brand
carModelSchema.index({ name: 1, brand: 1 }, { unique: true });

const CarModel = mongoose.model("CarModel", carModelSchema);

export default CarModel;
