import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "El nombre es requerido"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "El email es requerido"],
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: [true, "La contraseña es requerida"],
		minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
	},
	role: {
		type: String,
		enum: ["superadmin", "admin", "client"],
		default: "client",
	},
	phone: {
		type: String,
		trim: true,
	},
	address: {
		type: String,
		trim: true,
	},
	registrationDate: {
		type: Date,
		default: Date.now,
	},
	commissionedCars: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Car",
		},
	],
	isDirectBuyer: {
		type: Boolean,
		default: false,
	},
	active: {
		type: Boolean,
		default: true,
	},
	temporaryPassword: {
		type: Boolean,
		default: false,
	},
	resetPasswordCode: {
		type: String,
		select: false,
	},
	resetPasswordExpires: {
		type: Date,
		select: false,
	},
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return;

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (error) {
		next(error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
