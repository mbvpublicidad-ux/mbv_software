import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Car from "../models/Car.js";

const updateDua = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB\n");

		const csvPath = path.resolve("INFORMACION AUTOS(Hoja2).csv");
		const csvData = fs.readFileSync(csvPath, "utf8");

		const lines = csvData.trim().split("\n");
		let updated = 0;
		let skipped = 0;

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(";");
			const vin = values[0]?.trim();
			const duaDate = values[1]?.trim();

			if (!vin || !duaDate) {
				skipped++;
				continue;
			}

			const car = await Car.findOne({ vin });
			if (!car) {
				console.log(`Not found: ${vin}`);
				skipped++;
				continue;
			}

			car.duaRegistrationDate = new Date(duaDate);
			await car.save();
			updated++;
			console.log(`✅ ${vin}: ${duaDate}`);
		}

		console.log(`\n--- Summary ---`);
		console.log(`✅ Updated: ${updated}`);
		console.log(`⏭️ Skipped: ${skipped}`);

		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
};

updateDua();
