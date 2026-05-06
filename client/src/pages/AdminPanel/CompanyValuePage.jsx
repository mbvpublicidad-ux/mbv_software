/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_CARS } from "../../graphql/queries/carQueries";
import { GET_EXPENSES } from "../../graphql/queries/expenseQueries";
import { GET_JC_DEBT_SUMMARY } from "../../graphql/queries/jcPaymentQueries";
import { GET_CAR_ESTIMATES } from "../../graphql/queries/carEstimateQueries";
import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";

import { SAVE_CAR_ESTIMATE } from "../../graphql/mutations/carEstimateMutations";

import { LoadingOverlay } from "../../components/ui/LoadingUi";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { BsCalculator, BsDownload } from "react-icons/bs";

import { formatCRC } from "../../utils/formatters";

const CompanyValuePage = () => {
	const { data: carsData, loading: carsLoading } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});

	const { data: estimatesData } = useQuery(GET_CAR_ESTIMATES);
	const { data: exchangeData } = useQuery(GET_EXCHANGE_RATE);
	const { data: jcDebtData } = useQuery(GET_JC_DEBT_SUMMARY);
	const { data: expensesData } = useQuery(GET_EXPENSES);

	const [saveCarEstimate] = useMutation(SAVE_CAR_ESTIMATE);

	const exchangeRate = exchangeData?.exchangeRate?.value || 0;
	const estimates = estimatesData?.carEstimates || [];
	const allExpenses = expensesData?.expenses || [];
	const jcSummary = jcDebtData?.jcDebtSummary;
	const cars = carsData?.cars?.cars || [];

	const [carExpensesEstimate, setCarExpensesEstimate] = useState(() => {
		const initial = {};
		estimates.forEach((est) => {
			if (est.car?._id) {
				initial[est.car._id] = {
					taxes: est.estimatedTaxes || "",
					vat: est.estimatedVAT || "",
					registration: est.estimatedRegistration || "",
				};
			}
		});
		return initial;
	});

	useEffect(() => {
		if (estimates.length > 0) {
			const data = {};
			estimates.forEach((est) => {
				if (est.car?._id) {
					data[est.car._id] = {
						taxes: est.estimatedTaxes || "",
						vat: est.estimatedVAT || "",
						registration: est.estimatedRegistration || "",
					};
				}
			});
			setCarExpensesEstimate(data);
		}
	}, [estimatesData]);

	// Autos no vendidos
	const availableCars = useMemo(
		() => cars.filter((c) => c.availability !== "Sold"),
		[cars],
	);

	const taxesPaid = useMemo(() => {
		const paid = {};
		availableCars.forEach((car) => {
			const hasTaxes = allExpenses.some(
				(e) => e.car?._id === car._id && e.type === "Taxes",
			);
			paid[car._id] = hasTaxes;
		});
		return paid;
	}, [availableCars, allExpenses]);

	const totals = useMemo(() => {
		const totalSales = availableCars.reduce(
			(sum, c) => sum + (c.publishedPriceCRC || 0),
			0,
		);

		const totalTaxes = Object.entries(carExpensesEstimate).reduce(
			(sum, [carId, est]) => {
				const taxes = taxesPaid[carId] ? 0 : Number(est.taxes) || 0;
				return sum + taxes;
			},
			0,
		);

		const totalVAT = Object.values(carExpensesEstimate).reduce(
			(sum, est) => sum + (Number(est.vat) || 0),
			0,
		);

		const totalRegistration = Object.values(carExpensesEstimate).reduce(
			(sum, est) => sum + (Number(est.registration) || 0),
			0,
		);

		const totalEstimatedExpenses = Object.entries(carExpensesEstimate).reduce(
			(sum, [carId, est]) => {
				const taxes = taxesPaid[carId] ? 0 : Number(est.taxes) || 0;
				const vat = Number(est.vat) || 0;
				const registration = Number(est.registration) || 0;
				return sum + taxes + vat + registration;
			},
			0,
		);

		// Pendiente por pagar a JC
		const pendingJC = jcSummary?.totalPendingUSD || 0;
		const pendingJCCRC = pendingJC * exchangeRate;

		// Valor de la empresa
		const companyValue = totalSales - totalEstimatedExpenses - pendingJCCRC;

		return {
			totalSales,
			totalTaxes,
			totalVAT,
			totalRegistration,
			totalEstimatedExpenses,
			pendingJCCRC,
			pendingJC,
			companyValue,
			availableCarsCount: availableCars.length,
		};
	}, [availableCars, exchangeRate, jcSummary, carExpensesEstimate, taxesPaid]);

	const handleDownloadPDF = () => {
		const reportContent = document.getElementById("company-value-report");
		if (!reportContent) return;

		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		const styles = document.querySelectorAll("style, link[rel='stylesheet']");
		let styleContent = "";
		styles.forEach((style) => {
			styleContent += style.outerHTML;
		});

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Valor de la Empresa</title>
				${styleContent}
				<style>
				body { padding: 20px; background: white; color: black; }
				@media print { body { padding: 0; } }
				</style>
			</head>
			<body>
				${reportContent.innerHTML}
			</body>
			</html>
		`);
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => printWindow.print(), 500);
	};

	if (carsLoading)
		return <LoadingOverlay visible={true} text="Calculando..." />;

	return (
		<div className="min-h-screen pb-16">
			<div className="px-4 sm:px-6 lg:px-8 py-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-first flex items-center gap-3">
						<BsCalculator className="w-8 h-8 text-second" />
						Valor de la Empresa
					</h1>
					<p className="text-first/50 mt-1">
						Cálculo estimado basado en {totals.availableCarsCount} autos
						disponibles
					</p>
				</div>

				{/* Tabla de gastos estimados por auto */}
				<div className="overflow-x-auto">
					<table className="min-w-130 md:w-full text-sm">
						<thead>
							<tr className="border-b border-first/10">
								<th className="text-left p-2 text-xs font-medium text-first/40">
									Auto
								</th>
								<th className="text-left p-2 text-xs font-medium text-first/40">
									Precio
								</th>
								<th className="text-left p-2 text-xs font-medium text-first/40">
									Impuestos (CRC)
								</th>
								<th className="text-left p-2 text-xs font-medium text-first/40">
									IVA (CRC)
								</th>
								<th className="text-left p-2 text-xs font-medium text-first/40">
									Inscripción (CRC)
								</th>
							</tr>
						</thead>
						<tbody>
							{availableCars.map((car) => {
								const hasTaxesPaid = taxesPaid[car._id]; // Detectado automáticamente
								return (
									<tr key={car._id} className="border-b border-first/5">
										<td className="p-2 text-first">
											{car.carModel?.name} {car.year} {car.vin.slice(-6)}
										</td>
										<td className="p-2 text-first/60">
											{formatCRC(car.publishedPriceCRC)}
										</td>
										<td className="p-2">
											{hasTaxesPaid ? (
												<span className="text-xs text-success">
													{formatCRC(
														allExpenses.find(
															(e) =>
																e.car?._id === car._id && e.type === "Taxes",
														)?.amount || 0,
													)}
												</span>
											) : (
												<Input
													type="number"
													size="sm"
													value={carExpensesEstimate[car._id]?.taxes || ""}
													onChange={(e) =>
														setCarExpensesEstimate((prev) => ({
															...prev,
															[car._id]: {
																...prev[car._id],
																taxes: e.target.value,
															},
														}))
													}
													onBlur={() => {
														saveCarEstimate({
															variables: {
																input: {
																	car: car._id,
																	estimatedTaxes:
																		Number(
																			carExpensesEstimate[car._id]?.taxes,
																		) || 0,
																	estimatedVAT:
																		Number(carExpensesEstimate[car._id]?.vat) ||
																		0,
																	estimatedRegistration:
																		Number(
																			carExpensesEstimate[car._id]
																				?.registration,
																		) || 0,
																},
															},
														});
													}}
													placeholder="0"
													min={0}
												/>
											)}
										</td>
										<td className="p-2">
											<Input
												type="number"
												size="sm"
												value={carExpensesEstimate[car._id]?.vat || ""}
												onChange={(e) =>
													setCarExpensesEstimate((prev) => ({
														...prev,
														[car._id]: {
															...prev[car._id],
															vat: e.target.value,
														},
													}))
												}
												onBlur={() => {
													saveCarEstimate({
														variables: {
															input: {
																car: car._id,
																estimatedTaxes:
																	Number(carExpensesEstimate[car._id]?.taxes) ||
																	0,
																estimatedVAT:
																	Number(carExpensesEstimate[car._id]?.vat) ||
																	0,
																estimatedRegistration:
																	Number(
																		carExpensesEstimate[car._id]?.registration,
																	) || 0,
															},
														},
													});
												}}
												placeholder="0"
												min={0}
											/>
										</td>
										<td className="p-2">
											<Input
												type="number"
												size="sm"
												value={carExpensesEstimate[car._id]?.registration || ""}
												onChange={(e) =>
													setCarExpensesEstimate((prev) => ({
														...prev,
														[car._id]: {
															...prev[car._id],
															registration: e.target.value,
														},
													}))
												}
												onBlur={() => {
													saveCarEstimate({
														variables: {
															input: {
																car: car._id,
																estimatedTaxes:
																	Number(carExpensesEstimate[car._id]?.taxes) ||
																	0,
																estimatedVAT:
																	Number(carExpensesEstimate[car._id]?.vat) ||
																	0,
																estimatedRegistration:
																	Number(
																		carExpensesEstimate[car._id]?.registration,
																	) || 0,
															},
														},
													});
												}}
												placeholder="0"
												min={0}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Resumen */}
				<div id="company-value-report">
					<div className="grid grid-cols-[1fr_2fr] gap-6 my-6">
						<div className="bg-main rounded-2xl border border-first/10 p-6">
							<h2 className="text-lg text-center font-semibold text-first mb-4">
								Resumen
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm text-first/60">
										Ventas potenciales
									</span>
									<span className="text-sm font-medium text-first">
										{formatCRC(totals.totalSales)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-first/60">Total Gastos</span>
									<span className="text-sm font-medium text-error">
										-{formatCRC(totals.totalEstimatedExpenses)}
									</span>
								</div>
								<div className="flex justify-between ml-4">
									<span className="text-xs text-first/40">Impuestos</span>
									<span className="text-xs text-first/60">
										{formatCRC(totals.totalTaxes)}
									</span>
								</div>
								<div className="flex justify-between ml-4">
									<span className="text-xs text-first/40">IVA</span>
									<span className="text-xs text-first/60">
										{formatCRC(totals.totalVAT)}
									</span>
								</div>
								<div className="flex justify-between ml-4">
									<span className="text-xs text-first/40">Inscripción</span>
									<span className="text-xs text-first/60">
										{formatCRC(totals.totalRegistration)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-first/60">Pendiente a JC</span>
									<span className="text-sm font-medium text-error">
										-{formatCRC(totals.pendingJCCRC)}
									</span>
								</div>
							</div>
						</div>

						{/* Resultado */}
						<div className="bg-main rounded-2xl border border-first/10 p-6 flex flex-col items-center justify-center">
							<p className="text-sm text-first/50 mb-2">
								Valor estimado de la empresa
							</p>
							<p
								className={`text-4xl font-bold ${
									totals.companyValue >= 0 ? "text-success" : "text-error"
								}`}
							>
								{formatCRC(totals.companyValue)}
							</p>
							<p className="text-xs text-first/30 mt-2">
								Ventas - Gastos reales - Gastos estimados - Gastos JC -
								Pendiente JC
							</p>
						</div>
					</div>
				</div>
				<div className="flex justify-center">
					<Button
						variant="secondary"
						size="sm"
						onClick={handleDownloadPDF}
						className="mt-5"
						icon={<BsDownload className="w-4 h-4" />}
					>
						Descargar PDF
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CompanyValuePage;
