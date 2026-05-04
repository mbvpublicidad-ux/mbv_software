const sendWhatsAppMessage = async (phone, message, mediaUrl = null) => {
	try {
		const data = {
			receiver: phone,
			msgtext: message,
			token: process.env.WHATSAPP_API_TOKEN,
		};

		if (mediaUrl) {
			data.mediaurl = mediaUrl;
		}

		const response = await fetch("https://api.dstic.net/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams(data).toString(),
		});

		const result = await response.json();
		console.log("WhatsApp API response:", result);
		return result;
	} catch (error) {
		console.error("Error sending WhatsApp message:", error);
		return { success: false, error: error.message };
	}
};

export const notifyClientLogisticChange = async (client, car) => {
	if (!client.phone) {
		console.log(`Client ${client.name} has no phone number`);
		return;
	}

	const statusMessages = {
		"In transit": "en camino de Florida a Costa Rica",
		"In warehouse": "en nuestro almacén en Costa Rica",
		"Dekra pending": "en proceso de inspección Dekra",
		"Available for direct sale": "disponible para entrega",
	};

	const statusText = statusMessages[car.logisticStatus] || car.logisticStatus;

	const message = `🚗 *Importaciones MBV*\n\nHola ${client.name},\n\nTu vehículo *${car.brand.name} ${car.carModel.name} ${car.year}* ahora está: *${statusText}*.\n\nPuedes ver el estado completo en: https://importacionesmbv.com/my-cars\n\nGracias por confiar en nosotros.`;

	let phone = client.phone.replace(/\D/g, "");

	if (!phone.startsWith("506")) {
		phone = "506" + phone;
	}

	return sendWhatsAppMessage(phone, message);
};

export const notifyClientPayment = async (
	client,
	car,
	amount,
	pendingBalance,
) => {
	if (!client.phone) {
		console.log(`Client ${client.name} has no phone number`);
		return;
	}

	let phone = client.phone.replace(/\D/g, "");
	if (phone.startsWith("506")) {
		phone = phone.substring(3);
	}

	const message = `💰 *Pago Registrado*\n\nHola ${client.name},\n\nSe ha registrado un pago de *₡${amount.toLocaleString("es-CR")}* para tu vehículo *${car.brand?.name} ${car.carModel?.name} ${car.year}*.\n\nGracias por tu preferencia.`;

	return sendWhatsAppMessage(phone, message);
};
