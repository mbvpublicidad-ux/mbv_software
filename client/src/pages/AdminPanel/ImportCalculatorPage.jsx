import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";

import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";

import Input from "../../components/ui/Input";

import { BsCalculator, BsTruck, BsFileText } from "react-icons/bs";

import { formatCRC, formatUSD } from "../../utils/formatters";

const ImportCalculatorPage = () => {
	const { data: exchangeData } = useQuery(GET_EXCHANGE_RATE);
	const exchangeRate = exchangeData?.exchangeRate?.value || 0;

	const [carInfo, setCarInfo] = useState({
		brand: "",
		model: "",
		year: new Date().getFullYear(),
	});

	const [services, setServices] = useState({
		carCost: "",
		towTruck: 175,
		inspection: 200,
		shippingLine: 1125,
		serviceCommission: 1500,
	});

	const [agencyData, setAgencyData] = useState({
		invoiceValue: "",
		freight: 800,
		agencyCost: 110000,
		mileageCost: 30000,
		agilityCost: 150000,
	});

	const handleServiceChange = (field, value) => {
		setServices((prev) => ({ ...prev, [field]: value }));
	};

	const handleAgencyChange = (field, value) => {
		setAgencyData((prev) => ({ ...prev, [field]: value }));
	};

	const totals = useMemo(() => {
		// Totales de servicios
		const servicesTotal =
			(Number(services.carCost) || 0) +
			(Number(services.towTruck) || 0) +
			(Number(services.inspection) || 0) +
			(Number(services.shippingLine) || 0) +
			(Number(services.serviceCommission) || 0);

		// Cálculo de impuestos
		const invoiceValue = Number(agencyData.invoiceValue) || 0;
		const freight = Number(agencyData.freight) || 0;
		const secure = (invoiceValue + freight) * 1.1 * 0.008;
		const cif = invoiceValue + freight + secure;

		const currentYear = new Date().getFullYear();
		const carAge = currentYear - Number(carInfo.year);
		const taxRate = carAge <= 5 ? 0.48 : 0.684;

		const taxes = cif * exchangeRate * taxRate;

		const agencyTotal =
			(Number(agencyData.agencyCost) || 0) +
			(Number(agencyData.mileageCost) || 0) +
			(Number(agencyData.agilityCost) || 0);

		const impuestosTotal = taxes + agencyTotal;

		// Gran total
		const grandTotal = servicesTotal * exchangeRate + impuestosTotal;

		return {
			servicesTotal,
			cif,
			secure,
			taxes,
			agencyTotal,
			impuestosTotal,
			grandTotal,
			carAge,
			taxRate,
		};
	}, [services, agencyData, carInfo.year, exchangeRate]);

	return (
		<div className="min-h-screen pb-16">
			<div className="px-4 sm:px-6 lg:px-8 py-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-first flex items-center gap-3">
						<BsCalculator className="w-8 h-8 text-second" />
						Calculadora de Importación
					</h1>
					<p className="text-first/50 mt-1">
						Calcula el costo estimado de traer un auto desde Florida, USA a
						Costa Rica
					</p>
				</div>

				{/* Tipo de cambio */}
				<div className="bg-second/5 rounded-xl p-4 mb-6 text-center">
					<p className="text-sm text-first/50">Tipo de cambio actual</p>
					<p className="text-2xl font-bold text-second">
						{formatCRC(exchangeRate)} por USD
					</p>
				</div>

				{/* Datos del auto */}
				<div className="bg-main rounded-2xl border border-first/10 p-6 mb-6">
					<h2 className="text-lg font-semibold text-first mb-4">
						Datos del Vehículo
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Input
							label="Marca"
							value={carInfo.brand}
							onChange={(e) =>
								setCarInfo((p) => ({ ...p, brand: e.target.value }))
							}
							placeholder="Ej: Hyundai"
							size="sm"
						/>
						<Input
							label="Modelo"
							value={carInfo.model}
							onChange={(e) =>
								setCarInfo((p) => ({ ...p, model: e.target.value }))
							}
							placeholder="Ej: Tucson"
							size="sm"
						/>
						<Input
							label="Año"
							type="number"
							value={carInfo.year}
							onChange={(e) =>
								setCarInfo((p) => ({ ...p, year: e.target.value }))
							}
							min={1990}
							max={new Date().getFullYear()}
							size="sm"
						/>
					</div>
					{carInfo.year && (
						<p className="text-sm text-first/40 mt-2">
							Antigüedad: {totals.carAge} años → Impuesto:{" "}
							{(totals.taxRate * 100).toFixed(1)}% sobre CIF
						</p>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Servicios Logísticos */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4 flex items-center gap-2">
							<BsTruck className="w-5 h-5 text-second" />
							Servicios Logísticos
						</h2>
						<div className="space-y-3">
							<Input
								label="Costo real del auto (USD)"
								type="number"
								value={services.carCost}
								onChange={(e) => handleServiceChange("carCost", e.target.value)}
								placeholder="0"
								min={0}
								size="sm"
							/>
							<Input
								label="Grúa (USD)"
								type="number"
								value={services.towTruck}
								onChange={(e) =>
									handleServiceChange("towTruck", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<Input
								label="Revisión (USD)"
								type="number"
								value={services.inspection}
								onChange={(e) =>
									handleServiceChange("inspection", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<Input
								label="Naviera (USD)"
								type="number"
								value={services.shippingLine}
								onChange={(e) =>
									handleServiceChange("shippingLine", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<Input
								label="Comisión de servicio (USD)"
								type="number"
								value={services.serviceCommission}
								onChange={(e) =>
									handleServiceChange("serviceCommission", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<div className="flex justify-between pt-3 border-t border-first/10">
								<span className="text-sm font-semibold text-first">
									Total Servicios
								</span>
								<span className="text-lg font-bold text-second">
									{formatUSD(totals.servicesTotal)}
								</span>
							</div>
						</div>
					</div>

					{/* Impuestos y Agencia */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4 flex items-center gap-2">
							<BsFileText className="w-5 h-5 text-second" />
							Impuestos y Agencia
						</h2>
						<div className="space-y-3">
							<Input
								label="Valor de factura (USD)"
								type="number"
								value={agencyData.invoiceValue}
								onChange={(e) =>
									handleAgencyChange("invoiceValue", e.target.value)
								}
								placeholder="0"
								min={0}
								size="sm"
							/>
							<Input
								label="Flete (USD)"
								type="number"
								value={agencyData.freight}
								onChange={(e) => handleAgencyChange("freight", e.target.value)}
								min={0}
								size="sm"
							/>
							<div className="p-3 bg-first/5 rounded-lg">
								<div className="flex justify-between text-sm">
									<span className="text-first/60">Valor CIF</span>
									<span className="text-first font-medium">
										{formatUSD(totals.cif)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-first/60">Seguro</span>
									<span className="text-first font-medium">
										{formatUSD(totals.secure)}
									</span>
								</div>
								<div className="flex justify-between text-sm mt-1">
									<span className="text-first/60">
										Impuestos ({(totals.taxRate * 100).toFixed(1)}%)
									</span>
									<span className="text-first font-medium">
										{formatCRC(totals.taxes)}
									</span>
								</div>
							</div>
							<Input
								label="Costo de agencia (CRC)"
								type="number"
								value={agencyData.agencyCost}
								onChange={(e) =>
									handleAgencyChange("agencyCost", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<Input
								label="Millas (CRC)"
								type="number"
								value={agencyData.mileageCost}
								onChange={(e) =>
									handleAgencyChange("mileageCost", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<Input
								label="Agilización (CRC)"
								type="number"
								value={agencyData.agilityCost}
								onChange={(e) =>
									handleAgencyChange("agilityCost", e.target.value)
								}
								min={0}
								size="sm"
							/>
							<div className="flex justify-between pt-3 border-t border-first/10">
								<span className="text-sm font-semibold text-first">
									Total Impuestos y Agencia
								</span>
								<span className="text-lg font-bold text-second">
									{formatCRC(totals.impuestosTotal)}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Gran Total */}
				<div className="mt-6 bg-linear-to-r from-second/80 to-second rounded-2xl p-6 text-center">
					<p className="text-main/70 text-sm mb-1">Gran Total</p>
					<p className="text-4xl font-bold text-main">
						{formatCRC(totals.grandTotal)}
					</p>
					<p className="text-main/60 text-sm mt-1">
						{formatUSD(totals.grandTotal / exchangeRate)}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ImportCalculatorPage;
