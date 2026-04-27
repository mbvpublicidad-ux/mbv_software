import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "El nombre de la marca es requerido"],
			unique: true,
			trim: true,
			uppercase: true,
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

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
