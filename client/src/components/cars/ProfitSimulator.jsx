/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CAR_EXPENSES_SUMMARY } from "../../graphql/queries/expenseQueries";
import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { formatCRC, formatUSD } from "../../utils/formatters";
import { BsCalculator, BsTrash } from "react-icons/bs";

const ProfitSimulator = ({ car }) => {
	const [simulatedPrice, setSimulatedPrice] = useState(
		car.finalSalePriceCRC || car.publishedPriceCRC,
	);
	const [manualExpenses, setManualExpenses] = useState([]);
	const [newExpense, setNewExpense] = useState({
		description: "",
		amount: "",
		currency: "CRC",
	});

	const { data: expensesData } = useQuery(GET_CAR_EXPENSES_SUMMARY, {
		variables: { carId: car._id },
	});

	const { data: exchangeData } = useQuery(GET_EXCHANGE_RATE);

	const exchangeRate = exchangeData?.exchangeRate?.value || 0;
	const expenses = expensesData?.carExpensesSummary?.expenses || [];

	// Calculate totals
	const realExpensesCRC = useMemo(() => {
		return expenses.reduce((sum, exp) => {
			if (exp.currency === "CRC") return sum + exp.amount;
			return sum + exp.amount * exchangeRate;
		}, 0);
	}, [expenses, exchangeRate]);

	const manualExpensesCRC = useMemo(() => {
		return manualExpenses.reduce((sum, exp) => {
			if (exp.currency === "CRC") return sum + Number(exp.amount);
			return sum + Number(exp.amount) * exchangeRate;
		}, 0);
	}, [manualExpenses, exchangeRate]);

	const totalExpenses = realExpensesCRC + manualExpensesCRC;
	const profit = simulatedPrice - totalExpenses;

	const addManualExpense = () => {
		if (!newExpense.amount || newExpense.amount <= 0) return;

		setManualExpenses([
			...manualExpenses,
			{
				id: Date.now(),
				description: newExpense.description || "Gasto manual",
				amount: Number(newExpense.amount),
				currency: newExpense.currency,
			},
		]);
		setNewExpense({ description: "", amount: "", currency: "CRC" });
	};

	const removeManualExpense = (id) => {
		setManualExpenses(manualExpenses.filter((exp) => exp.id !== id));
	};

	return (
		<div className="bg-main rounded-2xl border border-first/10 shadow-sm p-6">
			<h3 className="flex items-center gap-2 text-lg font-semibold text-first mb-6">
				<BsCalculator className="w-5 h-5 text-second" />
				Simulador de Ganancia
			</h3>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Left Column */}
				<div className="space-y-4">
					{/* Price Input */}
					<Input
						label="Precio de venta simulado (CRC)"
						type="number"
						size="md"
						value={simulatedPrice}
						onChange={(e) => setSimulatedPrice(Number(e.target.value) || 0)}
						min={0}
					/>

					{/* Exchange Rate Info */}
					<div className="p-3 bg-first/5 rounded-lg">
						<p className="text-sm text-first/40">
							Tipo de cambio actual:{" "}
							<span className="text-first font-medium">
								{formatCRC(exchangeRate)} por USD
							</span>
						</p>
					</div>

					{/* Add Manual Expense */}
					<div className="border-t border-first/10 pt-4">
						<h4 className="text-sm font-semibold text-first mb-3">
							Agregar gasto manual (solo simulación)
						</h4>
						<div className="space-y-2">
							<Input
								placeholder="Descripción"
								size="sm"
								value={newExpense.description}
								onChange={(e) =>
									setNewExpense((p) => ({ ...p, description: e.target.value }))
								}
							/>
							<div className="flex gap-2">
								<Input
									type="number"
									placeholder="Monto"
									size="sm"
									value={newExpense.amount}
									onChange={(e) =>
										setNewExpense((p) => ({ ...p, amount: e.target.value }))
									}
									min={0}
									className="flex-1"
								/>
								<select
									value={newExpense.currency}
									onChange={(e) =>
										setNewExpense((p) => ({ ...p, currency: e.target.value }))
									}
									className="w-24 px-2 py-1.5 rounded-md border border-first/20 bg-main text-first text-sm"
								>
									<option value="CRC">CRC</option>
									<option value="USD">USD</option>
								</select>
							</div>
							<Button
								variant="secondary"
								size="sm"
								fullWidth
								onClick={addManualExpense}
								disabled={!newExpense.amount}
							>
								Agregar
							</Button>
						</div>
					</div>
				</div>

				{/* Right Column - Summary */}
				<div className="space-y-4">
					<h4 className="text-sm font-semibold text-first">Resumen</h4>

					{/* Real Expenses */}
					<div className="space-y-2">
						<p className="text-xs text-first/40">Gastos reales del auto</p>
						{expenses.map((exp) => (
							<div
								key={exp._id}
								className="flex justify-between items-center py-1.5 px-3 bg-first/5 rounded-lg text-sm"
							>
								<span className="text-first/60">{exp.type}</span>
								<span className="text-first font-medium">
									{exp.currency === "CRC"
										? formatCRC(exp.amount)
										: formatUSD(exp.amount)}
								</span>
							</div>
						))}
						<div className="flex justify-between items-center py-1 px-3 border-t border-first/10">
							<span className="text-sm text-first/40">
								Subtotal gastos reales
							</span>
							<span className="text-sm font-semibold text-first">
								{formatCRC(realExpensesCRC)}
							</span>
						</div>
					</div>

					{/* Manual Expenses */}
					{manualExpenses.length > 0 && (
						<div className="space-y-2">
							<p className="text-xs text-first/40">
								Gastos manuales (simulación)
							</p>
							{manualExpenses.map((exp) => (
								<div
									key={exp.id}
									className="flex justify-between items-center py-1.5 px-3 bg-warning/5 rounded-lg text-sm"
								>
									<span className="text-first/60">{exp.description}</span>
									<div className="flex items-center gap-2">
										<span className="text-first font-medium">
											{exp.currency === "CRC"
												? formatCRC(exp.amount)
												: formatUSD(exp.amount)}
										</span>
										<button
											onClick={() => removeManualExpense(exp.id)}
											className="text-error/50 hover:text-error transition-colors"
										>
											<BsTrash className="w-3 h-3" />
										</button>
									</div>
								</div>
							))}
							<div className="flex justify-between items-center py-1 px-3 border-t border-first/10">
								<span className="text-sm text-first/40">Subtotal manual</span>
								<span className="text-sm font-semibold text-first">
									{formatCRC(manualExpensesCRC)}
								</span>
							</div>
						</div>
					)}

					{/* Total Expenses */}
					<div className="flex justify-between items-center py-2 px-3 bg-first/5 rounded-lg">
						<span className="text-sm font-semibold text-first">
							Total gastos
						</span>
						<span className="text-sm font-bold text-first">
							{formatCRC(totalExpenses)}
						</span>
					</div>

					{/* Profit */}
					<div
						className={`p-4 rounded-xl text-center ${
							profit >= 0 ? "bg-success/10" : "bg-error/10"
						}`}
					>
						<p className="text-sm text-first/50 mb-1">
							{profit >= 0 ? "Ganancia estimada" : "Pérdida estimada"}
						</p>
						<p
							className={`text-2xl font-bold ${
								profit >= 0 ? "text-success" : "text-error"
							}`}
						>
							{formatCRC(profit)}
						</p>
						<p className="text-xs text-first/30 mt-2">
							Precio de venta: {formatCRC(simulatedPrice)} | Gastos totales:{" "}
							{formatCRC(totalExpenses)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfitSimulator;
