import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
	BsCarFront,
	BsCashStack,
	BsGraphUp,
	BsTruck,
	BsBuilding,
	BsClipboardCheck,
	BsArrowRight,
	BsPieChart,
	BsBox,
	BsCurrencyDollar,
	BsCartDash,
	BsGraphUpArrow,
	BsBagCheck,
} from "react-icons/bs";

import { GET_CARS } from "../../graphql/queries/carQueries";
import { GET_EXPENSES } from "../../graphql/queries/expenseQueries";
import { GET_JC_PAYMENTS } from "../../graphql/queries/jcPaymentQueries";
import { GET_JC_DEBT_SUMMARY } from "../../graphql/queries/jcPaymentQueries";
import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";
import { GET_COMPANY_BALANCE } from "../../graphql/queries/companyBalanceQueries";
// import { GET_GENERAL_EXPENSES } from "../../graphql/queries/generalExpenseQueries";

import { UPDATE_EXCHANGE_RATE } from "../../graphql/mutations/exchangeRateMutations";
import { RECALCULATE_BALANCE } from "../../graphql/mutations/companyBalanceMutations";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { Modal } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import { formatCRC, formatUSD } from "../../utils/formatters";

import { useToast } from "../../context/ToastContext";

const AdminDashboardPage = () => {
	const { toast } = useToast();

	const [showExchangeModal, setShowExchangeModal] = useState(false);
	const [newExchangeRate, setNewExchangeRate] = useState("");
	const [updatingRate, setUpdatingRate] = useState(false);

	const { data: carsData, loading: carsLoading } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});

	const {
		data: balanceData,
		loading: balanceLoading,
		refetch: refetchBalance,
	} = useQuery(GET_COMPANY_BALANCE);

	const { data: jcDebtData, loading: jcDebtLoading } =
		useQuery(GET_JC_DEBT_SUMMARY);

	const { data: jcPaymentsData } = useQuery(GET_JC_PAYMENTS);

	const { data: exchangeData, refetch: refetchExchange } =
		useQuery(GET_EXCHANGE_RATE);

	const { data: expensesData } = useQuery(GET_EXPENSES);

	// const { data: generalExpensesData } = useQuery(GET_GENERAL_EXPENSES);

	const [updateExchangeRate] = useMutation(UPDATE_EXCHANGE_RATE);
	const [recalculateBalance] = useMutation(RECALCULATE_BALANCE);

	const loading = carsLoading || balanceLoading || jcDebtLoading;

	const cars = carsData?.cars?.cars || [];
	const jcSummary = jcDebtData?.jcDebtSummary;
	const allExpenses = expensesData?.expenses || [];
	const companyBalance = balanceData?.companyBalance;
	const jcPayments = jcPaymentsData?.jcPayments || [];
	const exchangeRate = exchangeData?.exchangeRate?.value || 0;
	// const generalExpenses = generalExpensesData?.generalExpenses || [];

	const availableCars = cars.filter((c) => c.availability === "Available");

	const carInventory = cars.filter((c) => c.availability !== "Sold");

	const soldCars = cars.filter((c) => c.availability === "Sold").length;

	const soldCarIds = new Set(
		cars.filter((c) => c.availability === "Sold").map((c) => c._id),
	);

	const reservedCars = cars.filter((c) => c.availability === "Reserved").length;

	const inRepairCars = cars.filter(
		(c) => c.availability === "Under repair",
	).length;

	const inTransit = cars.filter(
		(c) => c.logisticStatus === "In transit",
	).length;

	const inWarehouse = cars.filter(
		(c) => c.logisticStatus === "In warehouse",
	).length;

	const dekraPending = cars.filter(
		(c) => c.logisticStatus === "Dekra pending",
	).length;

	const availableForSale = cars.filter(
		(c) =>
			c.logisticStatus === "Available for direct sale" &&
			c.availability === "Available",
	).length;

	const paidJC_CarIds = new Set();
	jcPayments.forEach((p) => {
		(p.associatedCars || []).forEach((ac) => {
			if (ac.car?._id) paidJC_CarIds.add(ac.car._id);
		});
	});

	const totalSoldCarsExpensesCRC = allExpenses
		.filter((e) => {
			if (!e.car?._id) return false;
			if (!soldCarIds.has(e.car._id)) return false;
			return true; // Todos los gastos de autos vendidos cuentan
		})
		.reduce((sum, e) => {
			if (e.currency === "CRC") return sum + e.amount;
			const rate = e.exchangeRateUsed || exchangeRate;
			return sum + e.amount * rate;
		}, 0);

	// const totalExpensesCRC = allExpenses
	// 	.filter((e) => {
	// 		if (!e.isFromJuanCarlos) return true;
	// 		if (e.isFromJuanCarlos && e.car?._id && paidJC_CarIds.has(e.car._id))
	// 			return true;
	// 		return false;
	// 	})
	// 	.reduce((sum, e) => {
	// 		if (e.currency === "CRC") return sum + e.amount;
	// 		const rate = e.exchangeRateUsed || exchangeRate;
	// 		return sum + e.amount * rate;
	// 	}, 0);

	// const totalGeneralCRC = generalExpenses.reduce((sum, e) => {
	// 	if (e.currency === "CRC") return sum + e.amount;
	// 	const rate = e.exchangeRateUsed || exchangeRate;
	// 	return sum + e.amount * rate;
	// }, 0);

	// const totalAllExpensesCRC = totalExpensesCRC + totalGeneralCRC;

	const totalProfit = cars
		.filter((c) => c.availability === "Sold")
		.reduce((sum, c) => sum + (c.profitCRC || 0), 0);

	const totalSalesValue = cars
		.filter((c) => c.availability === "Sold")
		.reduce((sum, c) => sum + (c.finalSalePriceCRC || 0), 0);

	const commissionedSoldCars = cars.filter(
		(c) => c.owner === "Client" && c.availability === "Sold",
	).length;

	const statsCards = [
		{
			title: "Balance actual",
			value: formatCRC(
				(companyBalance?.currentBalanceCRC || 0) +
					(companyBalance?.currentBalanceUSD || 0) * exchangeRate,
			),
			icon: BsCashStack,
			color: "from-green-500/20 to-green-500/5",
			iconColor: "text-success",
			link: null,
		},
		{
			title: "Ventas totales",
			value: formatCRC(totalSalesValue),
			icon: BsGraphUp,
			color: "from-yellow-500/20 to-yellow-500/5",
			iconColor: "text-yellow-500",
			link: null,
		},
		{
			title: "Gastos de Autos Vendidos",
			value: formatCRC(totalSoldCarsExpensesCRC),
			icon: BsCartDash,
			color: "from-red-400/40 to-red-400/5",
			iconColor: "text-red-400",
			link: null,
		},
		{
			title: "Ganancias Autos Vendidos",
			value: formatCRC(totalProfit),
			icon: BsGraphUpArrow,
			color: "from-green-500/20 to-green-500/5",
			iconColor: "text-green-500",
			link: null,
		},
		{
			title: "Vendidos por encargo",
			value: commissionedSoldCars,
			icon: BsBagCheck,
			color: "from-indigo-500/20 to-indigo-500/5",
			iconColor: "text-indigo-500",
			link: "/admin/clients",
		},
		{
			title: "Valor del inventario",
			value: formatCRC(
				carInventory.reduce((sum, c) => sum + (c.publishedPriceCRC || 0), 0),
			),
			icon: BsBox,
			color: "from-amber-500/20 to-amber-500/5",
			iconColor: "text-amber-500",
			link: null,
		},
		{
			title: "Pendiente a JC",
			value: formatUSD(jcSummary?.totalPendingUSD || 0),
			icon: BsCurrencyDollar,
			color: "from-orange-500/20 to-orange-500/5",
			iconColor: "text-orange-500",
			link: "/admin/jc-payments",
		},
		{
			title: "Margen de ganancia",
			value:
				totalSalesValue > 0
					? ((totalProfit / totalSalesValue) * 100).toFixed(1) + "%"
					: "0%",
			icon: BsPieChart,
			color: "from-teal-500/20 to-teal-500/5",
			iconColor: "text-teal-500",
			link: null,
		},
	];

	const handleUpdateRate = async () => {
		if (!newExchangeRate || Number(newExchangeRate) <= 0) {
			return;
		}
		setUpdatingRate(true);
		try {
			await updateExchangeRate({
				variables: { value: Number(newExchangeRate) },
			});
			refetchExchange();
			refetchBalance();
			toast.success("Tipo de cambio actualizado");
		} catch (error) {
			console.error(error);
			toast.error("Error al actualizar");
		}
		setUpdatingRate(false);
		setShowExchangeModal(false);
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando dashboard..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold text-first">Panel Administrativo</h1>
				<p className="text-first/50 mt-1">Resumen general del negocio</p>
				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{statsCards.map((stat) => (
						<div
							key={stat.title}
							className={`relative bg-linear-to-br ${stat.color} rounded-2xl border border-first/10 p-6 overflow-hidden`}
						>
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-first/50">{stat.title}</p>
									<p className="text-2xl font-bold text-first mt-1">
										{stat.value}
									</p>
								</div>
								<div
									className={`w-10 h-10 rounded-xl bg-first/5 flex items-center justify-center ${stat.iconColor}`}
								>
									<stat.icon className="w-5 h-5" />
								</div>
							</div>
							{stat.title === "Balance actual" && (
								<Button
									variant="primary"
									size="xs"
									onClick={async () => {
										try {
											await recalculateBalance();
											refetchBalance();
										} catch (error) {
											toast.error("Error al recalcular balance", error.message);
										}
									}}
									className="mt-3"
								>
									Recalcular balance
								</Button>
							)}
							{stat.link && (
								<Link
									to={stat.link}
									className="inline-flex items-center gap-1 text-xs text-second hover:underline mt-3"
								>
									Ver detalles <BsArrowRight className="w-3 h-3" />
								</Link>
							)}
						</div>
					))}
				</div>
				{/* Detailed Stats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Availability Stats */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Disponibilidad de Vehículos
						</h2>
						<div className="space-y-3">
							{[
								{
									label: "Disponibles",
									value: availableCars.length,
									total: cars.length,
									color: "bg-success",
								},
								{
									label: "Reservados",
									value: reservedCars,
									total: cars.length,
									color: "bg-warning",
								},
								{
									label: "En reparación",
									value: inRepairCars,
									total: cars.length,
									color: "bg-blue-500",
								},
								{
									label: "Vendidos",
									value: soldCars,
									total: cars.length,
									color: "bg-error",
								},
							].map((item) => (
								<div key={item.label}>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-first/60">{item.label}</span>
										<span className="text-first font-medium">{item.value}</span>
									</div>
									<div className="w-full bg-first/5 rounded-full h-2">
										<div
											className={`${item.color} h-2 rounded-full transition-all duration-500`}
											style={{
												width: `${item.total ? (item.value / item.total) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Logistic Stats */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Estado Logístico
						</h2>
						<div className="grid grid-cols-2 gap-4">
							{[
								{
									label: "En camino",
									value: inTransit,
									icon: BsTruck,
									color: "text-blue-500",
								},
								{
									label: "En almacén",
									value: inWarehouse,
									icon: BsBuilding,
									color: "text-yellow-500",
								},
								{
									label: "Dekra pendiente",
									value: dekraPending,
									icon: BsClipboardCheck,
									color: "text-orange-500",
								},
								{
									label: "Venta directa",
									value: availableForSale,
									icon: BsCarFront,
									color: "text-green-500",
								},
							].map((item) => (
								<div
									key={item.label}
									className="bg-first/5 rounded-xl p-4 flex items-center gap-3"
								>
									<div
										className={`w-10 h-10 rounded-lg bg-first/10 flex items-center justify-center ${item.color}`}
									>
										<item.icon className="w-5 h-5" />
									</div>
									<div>
										<p className="text-2xl font-bold text-first">
											{item.value}
										</p>
										<p className="text-xs text-first/40">{item.label}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				{/* Financial Summary */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Company Balance */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Balance de Caja
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Balance CRC</span>
								<span className="text-sm font-bold text-second">
									{formatCRC(companyBalance?.currentBalanceCRC || 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Balance USD</span>
								<span className="text-sm font-bold text-second">
									{formatUSD(companyBalance?.currentBalanceUSD || 0)}
								</span>
							</div>
							<div className="border-t border-first/10 pt-3">
								<div className="flex justify-between">
									<span className="text-sm text-first/50">
										Balance total (CRC)
									</span>
									<span className="text-sm font-bold text-second">
										{formatCRC(
											(companyBalance?.currentBalanceCRC || 0) +
												(companyBalance?.currentBalanceUSD || 0) * exchangeRate,
										)}
									</span>
								</div>
							</div>
							<div className="border-t border-first/10 pt-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-first/50">Tipo de cambio</span>
									<button
										onClick={() => {
											setNewExchangeRate(exchangeRate?.toString() || "");
											setShowExchangeModal(true);
										}}
										className="text-sm font-medium text-first hover:text-second transition-colors underline underline-offset-2"
									>
										{formatCRC(exchangeRate)} / USD
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* JC Debt */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Inversión de Juan Carlos
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Total invertido</span>
								<span className="text-sm font-medium text-first">
									{formatUSD(jcSummary?.totalInvestedUSD || 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Total pagado</span>
								<span className="text-sm font-medium text-success">
									{formatUSD(jcSummary?.totalPaidUSD || 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Saldo pendiente</span>
								<span className="text-sm font-bold text-error">
									{formatUSD(jcSummary?.totalPendingUSD || 0)}
								</span>
							</div>
						</div>
						<Link
							to="/admin/jc-payments"
							className="inline-flex items-center gap-1 text-xs text-second hover:underline mt-4"
						>
							Ver pagos <BsArrowRight className="w-3 h-3" />
						</Link>
					</div>
				</div>
				{/* Modal para actualizar tipo de cambio */}
				<Modal
					isOpen={showExchangeModal}
					onClose={() => setShowExchangeModal(false)}
					title="Configuración de Balance"
					size="sm"
				>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-first/50 mb-1">
								Tipo de cambio actual
							</p>
							<p className="text-xl font-bold text-first">
								{formatCRC(exchangeRate)} por USD
							</p>
						</div>
						<Input
							label="Nuevo valor (CRC por USD)"
							type="number"
							value={newExchangeRate}
							onChange={(e) => setNewExchangeRate(e.target.value)}
							placeholder="Ej: 540"
							min={0}
							size="md"
						/>
						<Button
							onClick={handleUpdateRate}
							loading={updatingRate}
							disabled={!newExchangeRate || Number(newExchangeRate) <= 0}
							size="sm"
							fullWidth
						>
							Actualizar tipo de cambio
						</Button>

						<div className="flex justify-end pt-2">
							<Button
								variant="ghost"
								onClick={() => setShowExchangeModal(false)}
							>
								Cerrar
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default AdminDashboardPage;
