import mongoose from "mongoose";

const daveCarSchema = new mongoose.Schema({
	vin: {
		type: String,
		required: [true, "El VIN es requerido"],
		unique: true,
		trim: true,
		uppercase: true,
	},
	dua: {
		type: String,
		required: [true, "El DUA es requerido"],
		unique: true,
		trim: true,
	},
	brand: {
		type: String,
		required: [true, "La marca es requerida"],
		trim: true,
	},
	model: {
		type: String,
		required: [true, "El modelo es requerido"],
		trim: true,
	},
	year: {
		type: Number,
		required: [true, "El año es requerido"],
	},
	color: {
		type: String,
		required: [true, "El color es requerido"],
		trim: true,
	},
	duaRegistrationDate: {
		type: Date,
	},
	owner: {
		type: String,
		default: "Dave",
	},
	availability: {
		type: String,
		enum: ["Available", "Sold"],
		default: "Available",
	},
	creationDate: {
		type: Date,
		default: Date.now,
	},
});

const DaveCar = mongoose.model("DaveCar", daveCarSchema);

export default DaveCar;
