/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { generateWhatsAppMessage, shareCar } from "../utils/whatsappMessage";

const WhatsAppContext = createContext(null);

export const WhatsAppProvider = ({ children }) => {
	const sendWhatsAppInquiry = (car) => {
		const url = generateWhatsAppMessage(car);
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const shareVehicle = async (car) => {
		return shareCar(car);
	};

	const value = {
		sendWhatsAppInquiry,
		shareVehicle,
	};

	return (
		<WhatsAppContext.Provider value={value}>
			{children}
		</WhatsAppContext.Provider>
	);
};

export const useWhatsApp = () => {
	const context = useContext(WhatsAppContext);
	if (!context)
		throw new Error("useWhatsApp must be used within WhatsAppProvider");
	return context;
};
