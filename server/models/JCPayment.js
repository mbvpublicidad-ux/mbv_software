import mongoose from "mongoose";

const jcPaymentSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: [true, "El monto es requerido"],
		min: 0,
	},
	actualPaymentDate: {
		type: Date,
		required: [true, "La fecha del pago es requerida"],
		validate: {
			validator: function (value) {
				return value <= new Date();
			},
			message: "La fecha del pago no puede ser en el futuro",
		},
	},
	registrationDate: {
		type: Date,
		default: Date.now,
	},
	concept: {
		type: String,
		trim: true,
	},
	associatedCars: [
		{
			car: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Car",
			},
			amount: {
				type: Number,
				min: 0,
			},
		},
	],
	receipt: {
		type: String,
	},
	transferReference: {
		type: String,
		trim: true,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "El creador es requerido"],
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	updatable: {
		type: Boolean,
		default: true,
	},
});

const JCPayment = mongoose.model("JCPayment", jcPaymentSchema);

export default JCPayment;
