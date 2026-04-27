import User from "../models/User.js";

const createSuperadmin = async () => {
	try {
		const superadmin = await User.findOne({
			email: process.env.SUPER_ADMIN_EMAIL,
		});

		if (superadmin) {
			console.log("Superadmin already exists, skipping superadmin creation");
			return;
		}

		await User.create({
			name: process.env.SUPER_ADMIN_NAME,
			email: process.env.SUPER_ADMIN_EMAIL,
			password: process.env.SUPER_ADMIN_PASSWORD,
			role: "superadmin",
		});

		console.log("Superadmin successfully created");
	} catch (error) {
		console.error("Error creating admin:", error.message);
	}
};

export default createSuperadmin;
