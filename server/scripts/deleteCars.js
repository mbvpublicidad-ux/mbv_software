import "dotenv/config";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import Expense from "../models/Expense.js";

const deleteCars = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB");

		const cars = await Car.find({ vin: { $ne: "KMHCU4AE1CU226513" } });
		console.log(`Found ${cars.length} cars to delete`);

		for (const car of cars) {
			await Expense.deleteMany({ car: car._id });
			await Car.findByIdAndDelete(car._id);
			console.log(`Deleted: ${car.vin}`);
		}

		console.log(`\nDone. Deleted ${cars.length} cars and their expenses.`);
		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
};

deleteCars();
