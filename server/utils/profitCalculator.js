import { convertUSDtoCRC } from "./currencyConverter.js";

export const calculateCarProfit = async (car, expenses) => {
	if (!car || !expenses) return 0;

	const finalPrice = car.finalSalePriceCRC || 0;

	let totalExpensesCRC = 0;

	for (const expense of expenses) {
		if (expense.currency === "CRC") {
			totalExpensesCRC += expense.amount;
		} else if (expense.currency === "USD") {
			const amountCRC = await convertUSDtoCRC(expense.amount);
			totalExpensesCRC += amountCRC;
		}
	}

	return finalPrice - totalExpensesCRC;
};
