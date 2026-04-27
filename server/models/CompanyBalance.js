import mongoose from "mongoose";

const companyBalanceSchema = new mongoose.Schema({
	initialAmount: {
		type: Number,
		required: [true, "El monto inicial es requerido"],
		min: 0,
	},
	currentBalance: {
		type: Number,
		required: [true, "El balance actual es requerido"],
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
