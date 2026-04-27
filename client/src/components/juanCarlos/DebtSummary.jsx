import { BsCashStack } from "react-icons/bs";
import { formatUSD } from "../../utils/formatters";

const DebtSummary = ({ summary }) => {
	if (!summary) return null;

	const cards = [
		{
			label: "Total invertido por JC",
			value: formatUSD(summary.totalInvestedUSD || 0),
			color: "from-blue-500/20 to-blue-500/5",
			border: "border-blue-500/10",
			iconBg: "bg-blue-500/10",
			iconColor: "text-blue-500",
			textColor: "text-first",
		},
		{
			label: "Total pagado",
			value: formatUSD(summary.totalPaidUSD || 0),
			color: "from-success/20 to-success/5",
			border: "border-success/10",
			iconBg: "bg-success/10",
			iconColor: "text-success",
			textColor: "text-success",
		},
		{
			label: "Saldo pendiente",
			value: formatUSD(summary.totalPendingUSD || 0),
			color:
				(summary.totalPendingUSD || 0) > 0
					? "from-error/20 to-error/5"
					: "from-success/20 to-success/5",
			border:
				(summary.totalPendingUSD || 0) > 0
					? "border-error/10"
					: "border-success/10",
			iconBg:
				(summary.totalPendingUSD || 0) > 0 ? "bg-error/10" : "bg-success/10",
			iconColor:
				(summary.totalPendingUSD || 0) > 0 ? "text-error" : "text-success",
			textColor:
				(summary.totalPendingUSD || 0) > 0 ? "text-error" : "text-success",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className={`bg-linear-to-br ${card.color} ${card.border} rounded-2xl border p-6`}
				>
					<div className="flex items-center gap-3 mb-2">
						<div
							className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}
						>
							<BsCashStack className={`w-5 h-5 ${card.iconColor}`} />
						</div>
						<p className="text-sm text-first/50">{card.label}</p>
					</div>
					<p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
				</div>
			))}
		</div>
	);
};

export default DebtSummary;
