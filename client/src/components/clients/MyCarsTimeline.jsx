import {
	BsCheckCircle,
	BsTruck,
	BsBuilding,
	BsClipboardCheck,
	BsCarFront,
} from "react-icons/bs";

const steps = [
	{
		status: "In transit",
		icon: BsTruck,
		label: "En camino",
		description: "De Florida a Costa Rica",
	},
	{
		status: "In warehouse",
		icon: BsBuilding,
		label: "En almacén",
		description: "Llegó a Costa Rica",
	},
	{
		status: "Dekra pending",
		icon: BsClipboardCheck,
		label: "Dekra pendiente",
		description: "Inspección técnica",
	},
	{
		status: "Available for direct sale",
		icon: BsCarFront,
		label: "Disponible",
		description: "Listo para entrega",
	},
];

const statusOrder = [
	"In transit",
	"In warehouse",
	"Dekra pending",
	"Available for direct sale",
];

const MyCarsTimeline = ({ logisticStatus }) => {
	const currentIndex = statusOrder.indexOf(logisticStatus);

	return (
		<div className="relative">
			{/* Line */}
			<div className="absolute top-4 left-4 right-4 h-0.5 bg-first/10">
				<div
					className="h-full bg-second transition-all duration-500 rounded-full"
					style={{
						width: `${((currentIndex + 1) / steps.length) * 100}%`,
					}}
				/>
			</div>

			{/* Steps */}
			<div className="relative flex justify-between">
				{steps.map((step, index) => {
					const isCompleted = index <= currentIndex;
					const isCurrent = index === currentIndex;
					const Icon = step.icon;

					return (
						<div
							key={step.status}
							className="flex flex-col items-center text-center"
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
									isCompleted
										? "bg-second text-main"
										: "bg-first/5 text-first/20"
								} ${isCurrent ? "ring-2 ring-second/30 ring-offset-2 ring-offset-main" : ""}`}
							>
								{isCompleted ? (
									<BsCheckCircle className="w-4 h-4" />
								) : (
									<Icon className="w-4 h-4" />
								)}
							</div>
							<p
								className={`text-xs font-medium mt-2 transition-colors duration-300 ${
									isCompleted ? "text-first" : "text-first/30"
								}`}
							>
								{step.label}
							</p>
							<p className="text-[10px] text-first/30 hidden sm:block">
								{step.description}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default MyCarsTimeline;
