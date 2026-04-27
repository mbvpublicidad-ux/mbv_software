import { formatCRC, getLogisticStatusText } from "./formatters";

/**
 * Generar mensaje predefinido para consulta por WhatsApp
 * @param {Object} car - Datos del auto
 * @returns {string} - Mensaje codificado para URL
 */
export const generateWhatsAppMessage = (car) => {
	const phone = import.meta.env.VITE_WHATSAPP || "50600000000";

	const mileage = car.adjustedMileage || car.actualMileage;

	const message = [
		`🚗 *Consulta sobre vehículo*`,
		``,
		`*${car.brand?.name || ""} ${car.carModel?.name || ""} ${car.year}*`,
		``,
		`📋 *Detalles:*`,
		`• Precio: ${formatCRC(car.publishedPriceCRC)}`,
		`• Millaje: ${mileage ? `${mileage.toLocaleString()} mi` : "N/A"}`,
		`• Transmisión: ${car.transmission === "Automatic" ? "Automática" : "Manual"}`,
		`• Tracción: ${car.drivetrain === "4x4" ? "4x4" : car.drivetrain === "Front" ? "Delantera" : "Trasera"}`,
		`• Combustible: ${car.fuelType}`,
		`• Carrocería: ${car.bodyType}`,
		`• Color: ${car.color}`,
		`• Estado: ${getLogisticStatusText(car.logisticStatus)}`,
		``,
		`Hola, me interesa este vehículo. ¿Podrían darme más información?`,
	].join("\n");

	const encodedMessage = encodeURIComponent(message);
	return `https://wa.me/${phone}?text=${encodedMessage}`;
};

/**
 * Compartir auto (Web Share API o copiar enlace)
 * @param {Object} car - Datos del auto
 * @returns {Promise<void>}
 */
export const shareCar = async (car) => {
	const carUrl = `${window.location.origin}/car/${car._id}`;
	const title = `${car.brand?.name || ""} ${car.carModel?.name || ""} ${car.year}`;
	const text = `${title} - ${car.bodyType} - Disponible en Importaciones MBV`;

	// Intentar usar Web Share API
	if (navigator.share) {
		try {
			await navigator.share({
				title,
				text,
				url: carUrl,
			});
			return;
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error("Error sharing:", error);
			}
		}
	}

	// Fallback: copiar enlace al portapapeles
	try {
		await navigator.clipboard.writeText(`${text}\n${carUrl}`);
		return { copied: true };
	} catch (error) {
		console.error("Error copying to clipboard:", error);
		throw error;
	}
};
