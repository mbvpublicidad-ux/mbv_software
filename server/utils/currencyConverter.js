import ExchangeRate from "../models/ExchangeRate.js";

export const getCurrentExchangeRate = async () => {
	const rate = await ExchangeRate.findOne().sort({ updateDate: -1 });
	if (!rate) {
		throw new Error(
			"No exchange rate configured. Please set up an exchange rate first.",
		);
	}
	return rate.value;
};

export const convertUSDtoCRC = async (amountUSD) => {
	if (!amountUSD || amountUSD === 0) return 0;
	const rate = await getCurrentExchangeRate();
	return amountUSD * rate;
};

export const convertCRCtoUSD = async (amountCRC) => {
	if (!amountCRC || amountCRC === 0) return 0;
	const rate = await getCurrentExchangeRate();
	return amountCRC / rate;
};
