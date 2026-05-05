import { getCurrentExchangeRate } from "./currencyConverter.js";

export const calculateCarProfit = async (car, expenses) => {
	if (!car || !expenses) return 0;

	const finalPrice = car.finalSalePriceCRC || 0;
	let totalExpensesCRC = 0;
	const currentRate = await getCurrentExchangeRate();

	for (const expense of expenses) {
		if (expense.currency === "CRC") {
			totalExpensesCRC += expense.amount;
		} else if (expense.currency === "USD") {
			const rate = expense.exchangeRateUsed || currentRate;
			totalExpensesCRC += expense.amount * rate;
		}
	}

	return finalPrice - totalExpensesCRC;
};
