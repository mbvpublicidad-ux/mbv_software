import { useQuery } from "@apollo/client/react";
import { GET_MY_CARS } from "../graphql/queries/carQueries";
import { GET_CLIENT_PAYMENTS } from "../graphql/queries/clientPaymentQueries";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { BsCarFront, BsChevronRight } from "react-icons/bs";
import MyCarsTimeline from "../components/clients/MyCarsTimeline";
import EmptyState from "../components/ui/EmptyState";
import { LoadingOverlay } from "../components/ui/LoadingUi";
import { formatCRC, getDetailsTranslation } from "../utils/formatters";
import Badge from "../components/ui/Badge";

const MyCarsPage = () => {
	const { user } = useAuth();
	const { data: carsData, loading: carsLoading } = useQuery(GET_MY_CARS);
	const { data: paymentsData, loading: paymentsLoading } = useQuery(
		GET_CLIENT_PAYMENTS,
		{
			variables: { clientId: user?._id },
		},
	);

	const myCars = carsData?.myCars || [];
	const myPayments = paymentsData?.clientPayments || [];

	const loading = carsLoading || paymentsLoading;

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold text-first mb-2">Mis Autos</h1>
				<p className="text-first/50 mb-8">
					Aquí puedes ver el estado y detalles de tus autos por encargo.
				</p>

				{loading && (
					<LoadingOverlay visible={true} text="Cargando tus autos..." />
				)}

				{!loading && myCars.length > 0 ? (
					<div className="space-y-8">
						{myCars.map((car) => {
							const carPayments = myPayments.filter(
								(p) => p.car?._id === car._id,
							);

							return (
								<div
									key={car._id}
									className="bg-main rounded-2xl border border-first/10 shadow-sm overflow-hidden"
								>
									<div className="p-6">
										{/* Car Header */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
											<div className="flex items-center gap-4">
												<div className="flex w-20 h-20 rounded-xl bg-first/5 items-center justify-center">
													<BsCarFront className="w-8 h-8 text-first/20" />
												</div>
												<div>
													<h2 className="text-xl font-semibold text-first">
														{car.brand?.name} {car.carModel?.name} {car.year}
													</h2>
													<Badge variant="warning" size="sm">
														{getDetailsTranslation(
															"availability",
															car.availability,
														)}
													</Badge>
												</div>
											</div>

											<Link
												to={`/car/${car._id}`}
												className="inline-flex items-center gap-1 text-sm text-second hover:underline"
											>
												Ver detalles
												<BsChevronRight className="w-3 h-3" />
											</Link>
										</div>

										{/* Timeline */}
										<div className="mb-6">
											<MyCarsTimeline logisticStatus={car.logisticStatus} />
										</div>

										{/* Progreso de pago */}
										<div className="mb-6">
											<div className="flex justify-between text-sm mb-1">
												<span className="text-first/60">Progreso de pago</span>
												<span className="text-first font-medium">
													{formatCRC(
														carPayments.reduce((sum, p) => sum + p.amount, 0),
													)}{" "}
													/ {formatCRC(car.publishedPriceCRC)}
												</span>
											</div>
											<div className="w-full bg-first/5 rounded-full h-2.5">
												<div
													className={`h-2.5 rounded-full transition-all duration-500 ${
														carPayments.reduce((sum, p) => sum + p.amount, 0) >=
														car.publishedPriceCRC
															? "bg-success"
															: "bg-second"
													}`}
													style={{
														width: `${Math.min(100, (carPayments.reduce((sum, p) => sum + p.amount, 0) / car.publishedPriceCRC) * 100)}%`,
													}}
												/>
											</div>
										</div>

										{/* Payments */}
										{carPayments.length > 0 && (
											<div>
												<h3 className="text-sm font-semibold text-first mb-3">
													Pagos Realizados
												</h3>
												<div className="space-y-2">
													{carPayments.map((payment) => (
														<div
															key={payment._id}
															className="flex items-center justify-between py-2 px-3 bg-first/5 rounded-lg"
														>
															<div>
																<p className="text-sm font-medium text-first">
																	{formatCRC(payment.amount)}
																</p>
																<p className="text-xs text-first/40">
																	{new Date(
																		payment.paymentDate,
																	).toLocaleDateString("es-CR")}
																	{payment.paymentMethod &&
																		` • ${payment.paymentMethod}`}
																</p>
															</div>
															{payment.pendingBalance > 0 && (
																<Badge variant="warning" size="sm">
																	Pendiente: {formatCRC(payment.pendingBalance)}
																</Badge>
															)}
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : !loading ? (
					<EmptyState
						icon={<BsCarFront className="w-12 h-12" />}
						title="No tienes autos asignados"
						description="Cuando te asignen un auto por encargo, aparecerá aquí con toda la información de seguimiento."
					/>
				) : null}
			</div>
		</div>
	);
};

export default MyCarsPage;
