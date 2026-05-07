/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_CARS } from "../../graphql/queries/carQueries";
import { GET_EXPENSES } from "../../graphql/queries/expenseQueries";
import { GET_JC_PAYMENTS } from "../../graphql/queries/jcPaymentQueries";

import {
	CREATE_JC_PAYMENT,
	UPDATE_JC_PAYMENT,
} from "../../graphql/mutations/jcPaymentMutations";

import { useToast } from "../../context/ToastContext";

import { formatUSD } from "../../utils/formatters";

import Input from "../ui/Input";
import Button from "../ui/Button";
import ImageUploader from "../cars/ImageUploader";
import CarSearchSelect from "../cars/CarSearchSelect";

const initialFormData = {
	amount: "",
	actualPaymentDate: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0],
	concept: "",
	associatedCars: [],
	transferReference: "",
};

const JCPaymentForm = ({ payment, onClose, onSuccess }) => {
	const { toast } = useToast();
	const isEditing = !!payment;

	const [formData, setFormData] = useState(() => {
		if (payment) {
			return {
				amount: payment.amount?.toString() || "",
				actualPaymentDate: payment.actualPaymentDate
					? payment.actualPaymentDate.split("T")[0]
					: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
							.toISOString()
							.split("T")[0],
				concept: payment.concept || "",
				associatedCars:
					payment.associatedCars?.map((ac) => ({
						carId: ac.car?._id || ac._id,
						amount: ac.amount?.toString() || "",
						debt: 0,
						pending: 0,
					})) || [],
				transferReference: payment.transferReference || "",
				receipt: payment.receipt || "",
			};
		}
		return initialFormData;
	});

	const [errors, setErrors] = useState({});

	const [selectedCarToAdd, setSelectedCarToAdd] = useState("");

	const [receipt, setReceipt] = useState(() => {
		return payment?.receipt ? [payment.receipt] : [];
	});

	const { data: carsData } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});

	const { data: expensesData } = useQuery(GET_EXPENSES);
	const { data: jcPaymentsData } = useQuery(GET_JC_PAYMENTS);

	useEffect(() => {
		if (!expensesData || !jcPaymentsData) return;

		setFormData((prev) => ({
			...prev,
			associatedCars: prev.associatedCars.map((item) => {
				const carExpenses = (expensesData?.expenses || []).filter(
					(e) => e.car?._id === item.carId && e.isFromJuanCarlos,
				);
				const totalDebt = carExpenses.reduce(
					(sum, e) => sum + (e.currency === "USD" ? e.amount : 0),
					0,
				);

				let alreadyPaid = 0;
				(jcPaymentsData?.jcPayments || []).forEach((p) => {
					const found = (p.associatedCars || []).find(
						(ac) => ac.car?._id === item.carId || ac._id === item.carId,
					);
					if (found) {
						alreadyPaid +=
							found.amount || p.amount / (p.associatedCars?.length || 1);
					}
				});

				const pending = Math.max(0, totalDebt - alreadyPaid);

				return { ...item, debt: totalDebt, pending };
			}),
		}));
	}, [expensesData, jcPaymentsData]);

	const [createPayment, { loading: creating }] = useMutation(CREATE_JC_PAYMENT);
	const [updatePayment, { loading: updating }] = useMutation(UPDATE_JC_PAYMENT);

	const cars = carsData?.cars?.cars || [];
	const loading = creating || updating;

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const handleReceiptChange = (images) => {
		setReceipt(images);
		handleChange("receipt", images[0] || "");
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.amount || Number(formData.amount) <= 0)
			newErrors.amount = "Requerido";
		if (!formData.actualPaymentDate) newErrors.actualPaymentDate = "Requerido";
		const today = new Date().toISOString().split("T")[0];
		if (formData.actualPaymentDate > today)
			newErrors.actualPaymentDate = "No puede ser fecha futura";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		const variables = {
			input: {
				amount: Number(formData.amount),
				actualPaymentDate: formData.actualPaymentDate,
				concept: formData.concept.trim() || undefined,
				associatedCars:
					formData.associatedCars.length > 0
						? formData.associatedCars.map((c) => ({
								car: c.carId,
								amount: Number(c.amount) || 0,
							}))
						: undefined,
				transferReference: formData.transferReference.trim() || undefined,
				receipt: formData.receipt || undefined,
			},
		};

		try {
			if (isEditing) {
				await updatePayment({
					variables: { id: payment._id, input: variables.input },
				});
				toast.success("Pago actualizado");
			} else {
				await createPayment({ variables: { input: variables.input } });
				toast.success("Pago registrado");
			}
			onSuccess?.();
			onClose();
		} catch (error) {
			toast.error(error.message || "Error al guardar pago");
		}
	};

	const totalAssigned = formData.associatedCars.reduce(
		(sum, c) => sum + (Number(c.amount) || 0),
		0,
	);

	const pendingToAssign = formData.amount - totalAssigned;

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Monto (USD)"
				type="number"
				value={formData.amount}
				onChange={(e) => handleChange("amount", e.target.value)}
				error={errors.amount}
				min={0}
				step="0.01"
				size="sm"
			/>
			<Input
				label="Fecha real del pago"
				type="date"
				value={formData.actualPaymentDate}
				onChange={(e) => handleChange("actualPaymentDate", e.target.value)}
				error={errors.actualPaymentDate}
				max={new Date().toISOString().split("T")[0]}
				size="sm"
			/>
			<Input
				label="Concepto (opcional)"
				value={formData.concept}
				onChange={(e) => handleChange("concept", e.target.value)}
				placeholder="Ej: Pago parcial factura #123"
				size="sm"
			/>
			<Input
				label="Referencia de transferencia (opcional)"
				value={formData.transferReference}
				onChange={(e) => handleChange("transferReference", e.target.value)}
				size="sm"
			/>
			<div>
				<p className="text-sm font-medium text-first/80 mb-2">
					Autos asociados (opcional)
				</p>

				{/* Buscador para agregar */}
				<div className="flex flex-col sm:flex-row sm:gap-2 mb-3">
					<div className="flex-1">
						<CarSearchSelect
							value={selectedCarToAdd}
							onChange={setSelectedCarToAdd}
							placeholder="Buscar auto para asociar..."
						/>
					</div>
					<Button
						type="button"
						size="sm"
						onClick={() => {
							if (!selectedCarToAdd) return;
							const alreadyAdded = formData.associatedCars.find(
								(c) => c.carId === selectedCarToAdd,
							);
							if (alreadyAdded) {
								setSelectedCarToAdd("");
								return;
							}
							// Calcular deuda JC del auto
							const carExpenses =
								expensesData?.expenses?.filter(
									(e) => e.car?._id === selectedCarToAdd && e.isFromJuanCarlos,
								) || [];
							const totalDebt = carExpenses.reduce(
								(sum, e) => sum + (e.currency === "USD" ? e.amount : 0),
								0,
							);
							// Calcular pagos previos a este auto
							let alreadyPaid = 0;
							(jcPaymentsData?.jcPayments || []).forEach((p) => {
								const found = (p.associatedCars || []).find(
									(ac) =>
										ac.car?._id === selectedCarToAdd ||
										ac._id === selectedCarToAdd,
								);
								if (found?.amount) {
									alreadyPaid += found.amount;
								} else if (found) {
									alreadyPaid += p.amount / (p.associatedCars?.length || 1);
								}
							});
							const pending = Math.max(0, totalDebt - alreadyPaid);

							setFormData((prev) => ({
								...prev,
								associatedCars: [
									...prev.associatedCars,
									{
										carId: selectedCarToAdd,
										amount: "",
										debt: totalDebt,
										pending,
									},
								],
							}));
							setSelectedCarToAdd("");
						}}
						disabled={!selectedCarToAdd}
						className="h-10 mt-5"
					>
						Agregar
					</Button>
				</div>

				{/* Lista de autos agregados con montos */}
				{formData.associatedCars.length > 0 ? (
					<div className="space-y-2">
						{formData.associatedCars.map((item, index) => {
							const car = cars.find((c) => c._id === item.carId);
							return (
								<div
									key={item.carId}
									className="border border-first/10 rounded-xl p-3 space-y-2"
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-first">
												{car?.brand?.name} {car?.carModel?.name} {car?.year}
											</p>
											<p className="text-xs text-first/40">
												Deuda: {formatUSD(item.debt)} | Pendiente:{" "}
												{formatUSD(item.pending)}
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="text-error"
											onClick={() => {
												setFormData((prev) => ({
													...prev,
													associatedCars: prev.associatedCars.filter(
														(_, i) => i !== index,
													),
												}));
											}}
										>
											Quitar
										</Button>
									</div>
									<Input
										label="Monto a pagar (USD)"
										type="number"
										size="sm"
										value={item.amount}
										onChange={(e) => {
											const newValue = Number(e.target.value) || 0;
											const maxAllowed =
												pendingToAssign + Number(item.amount || 0);
											const newCars = [...formData.associatedCars];
											newCars[index].amount = Math.min(
												newValue,
												maxAllowed,
											).toString();
											setFormData((prev) => ({
												...prev,
												associatedCars: newCars,
											}));
										}}
										min={0}
										max={pendingToAssign + Number(item.amount || 0)}
										placeholder={`Máx: ${pendingToAssign}`}
										hint={
											Number(item.amount) >
											pendingToAssign + Number(item.amount || 0)
												? "No puedes asignar más del restante"
												: undefined
										}
									/>
								</div>
							);
						})}

						{/* Total asignado */}
						<div className="flex flex-col text-sm text-first/60 text-right pt-2 border-t border-first/10">
							<div>Total asignado: {formatUSD(totalAssigned)}</div>
							<div>Restante por asignar: {formatUSD(pendingToAssign)}</div>
						</div>
					</div>
				) : (
					<p className="text-sm text-first/30 text-center py-4 border border-first/10 rounded-xl">
						No hay autos asociados
					</p>
				)}
			</div>
			<ImageUploader
				images={receipt}
				onImagesChange={handleReceiptChange}
				maxImages={1}
			/>
			<div className="flex justify-end gap-3 pt-4 border-t border-first/10">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" loading={loading}>
					{isEditing ? "Guardar cambios" : "Registrar pago"}
				</Button>
			</div>
		</form>
	);
};

export default JCPaymentForm;
