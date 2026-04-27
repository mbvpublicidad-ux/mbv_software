import mongoose from "mongoose";

const clientPaymentSchema = new mongoose.Schema({
	client: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "El cliente es requerido"],
	},
	car: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Car",
		required: [true, "El auto es requerido"],
	},
	amount: {
		type: Number,
		required: [true, "El monto es requerido"],
		min: 0,
	},
	paymentDate: {
		type: Date,
		required: [true, "La fecha del pago es requerida"],
	},
	paymentMethod: {
		type: String,
		trim: true,
	},
	pendingBalance: {
		type: Number,
		min: 0,
	},
	receipt: {
		type: String,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "El creador es requerido"],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const ClientPayment = mongoose.model("ClientPayment", clientPaymentSchema);

export default ClientPayment;
