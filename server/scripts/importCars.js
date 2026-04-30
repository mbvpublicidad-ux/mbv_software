import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import Brand from "../models/Brand.js";
import CarModel from "../models/CarModel.js";

const importCars = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB");

		const csvPath = path.resolve("INFORMACION AUTOS(DATA).csv");
		const csvData = fs.readFileSync(csvPath, "utf8");

		const lines = csvData.trim().split("\n");
		const headers = lines[0].split(";");

		console.log(`Found ${lines.length - 1} cars to import`);

		let imported = 0;
		let skipped = 0;
		let errors = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(";");
			const car = {};

			headers.forEach((header, index) => {
				const value = values[index]?.trim();
				car[header.trim()] = value || undefined;
			});

			try {
				// Check if car already exists by VIN
				const existing = await Car.findOne({ vin: car.vin });
				if (existing) {
					console.log(`Skipping ${car.vin} - already exists`);
					skipped++;
					continue;
				}

				// Find or create brand
				let brand = await Brand.findOne({ name: car.brand.toUpperCase() });
				if (!brand) {
					brand = await Brand.create({ name: car.brand.toUpperCase() });
					console.log(`Created brand: ${brand.name}`);
				}

				// Find or create model
				let carModel = await CarModel.findOne({
					name: car.carModel.toUpperCase(),
					brand: brand._id,
				});
				if (!carModel) {
					carModel = await CarModel.create({
						name: car.carModel.toUpperCase(),
						brand: brand._id,
					});
					console.log(`Created model: ${carModel.name}`);
				}

				// Create car
				await Car.create({
					brand: brand._id,
					carModel: carModel._id,
					vin: car.vin,
					dua: car.dua || undefined,
					year: Number(car.year),
					purchaseDate: new Date(car.purchaseDate),
					publishedPriceCRC: Number(car.publishedPriceCRC),
					purchaseValueUSD: Number(car.purchaseValueUSD),
					invoiceValueUSD: Number(car.invoiceValueUSD),
					owner: car.owner || "MBV",
					logisticStatus: car.logisticStatus || "In transit",
					availability: car.availability || "Available",
					actualMileage: Number(car.actualMileage) || 0,
					fuelType: car.fuelType || "Gasoline",
					engine: car.engine || "1800",
					transmission: car.transmission || "Automatic",
					drivetrain: car.drivetrain || "Front",
					color: car.color || "",
					bodyType: car.bodyType || "SUV",
				});

				imported++;
				console.log(`✅ ${car.brand} ${car.carModel} ${car.year} (${car.vin})`);
			} catch (error) {
				console.error(`❌ Error on row ${i}: ${car.vin} - ${error.message}`);
				errors.push({ row: i, vin: car.vin, error: error.message });
			}
		}

		console.log(`\n--- Import Summary ---`);
		console.log(`✅ Imported: ${imported}`);
		console.log(`⏭️ Skipped: ${skipped}`);
		console.log(`❌ Errors: ${errors.length}`);

		if (errors.length > 0) {
			console.log("\nError details:");
			errors.forEach((e) =>
				console.log(`  Row ${e.row} (${e.vin}): ${e.error}`),
			);
		}

		await mongoose.connection.close();
		console.log("\nConnection closed");
		process.exit(0);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	}
};

importCars();
