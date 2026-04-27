export const formatDate = (date) => {
	if (!date) return null;
	return new Date(date).toISOString();
};

export const isDateInRange = (date, startDate, endDate) => {
	if (!date) return false;
	const checkDate = new Date(date);

	if (startDate && new Date(startDate) > checkDate) return false;
	if (endDate && new Date(endDate) < checkDate) return false;

	return true;
};

export const getMonthRange = (year, month) => {
	const startDate = new Date(year, month - 1, 1);
	const endDate = new Date(year, month, 0, 23, 59, 59, 999);
	return { startDate, endDate };
};
