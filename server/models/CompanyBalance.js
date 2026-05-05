import mongoose from "mongoose";

const companyBalanceSchema = new mongoose.Schema({
	initialAmountCRC: {
		type: Number,
		required: [true, "El monto inicial en CRC es requerido"],
		min: 0,
		default: 0,
	},
	initialAmountUSD: {
		type: Number,
		required: [true, "El monto inicial en USD es requerido"],
		min: 0,
		default: 0,
	},
	currentBalanceCRC: {
		type: Number,
		required: [true, "El balance actual en CRC es requerido"],
		default: 0,
	},
	currentBalanceUSD: {
		type: Number,
		required: [true, "El balance actual en USD es requerido"],
		default: 0,
	},
	lastUpdated: {
		type: Date,
		default: Date.now,
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const CompanyBalance = mongoose.model("CompanyBalance", companyBalanceSchema);

export default CompanyBalance;
