import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { BsFilter, BsX } from "react-icons/bs";

const DateRangeFilter = ({ onFilterChange }) => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [isActive, setIsActive] = useState(false);

	const handleApply = () => {
		if (startDate || endDate) {
			onFilterChange({ startDate, endDate });
			setIsActive(true);
		}
	};

	const handleClear = () => {
		setStartDate("");
		setEndDate("");
		onFilterChange({ startDate: null, endDate: null });
		setIsActive(false);
	};

	return (
		<div className="flex flex-col text-center py-6 gap-2 max-w-50 items-center">
			<div className="flex gap-2 items-center">
				<Input
					type="date"
					size="sm"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className="w-40"
				/>
				<span className="text-first/30 text-sm">a</span>
				<Input
					type="date"
					size="sm"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className="w-40"
				/>
			</div>
			<Button
				variant={isActive ? "primary" : "ghost"}
				size="sm"
				onClick={handleApply}
				icon={<BsFilter className="w-4 h-4" />}
			>
				Filtrar
			</Button>
			{isActive && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					icon={<BsX className="w-4 h-4" />}
				>
					Limpiar
				</Button>
			)}
		</div>
	);
};

export default DateRangeFilter;
