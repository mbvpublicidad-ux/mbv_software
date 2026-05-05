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

// Nueva función para actualizar balance
export const processBalanceUpdate = async (
	balance,
	amount,
	currency,
	paidFrom,
	isReversal = false,
) => {
	const sign = isReversal ? 1 : -1;
	const effectivePaidFrom = paidFrom || currency;
	let convertedAmount = amount;
	let exchangeRateUsed = null;

	if (effectivePaidFrom === currency) {
		if (currency === "CRC") {
			balance.currentBalanceCRC += sign * amount;
		} else {
			balance.currentBalanceUSD += sign * amount;
		}
	} else {
		const rate = await getCurrentExchangeRate();
		exchangeRateUsed = rate;
		if (effectivePaidFrom === "USD") {
			convertedAmount = amount / rate;
			balance.currentBalanceUSD += sign * convertedAmount;
		} else {
			convertedAmount = amount * rate;
			balance.currentBalanceCRC += sign * convertedAmount;
		}
	}

	return { convertedAmount, exchangeRateUsed };
};
