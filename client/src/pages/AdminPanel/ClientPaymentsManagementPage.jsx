import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CLIENT_PAYMENTS } from "../../graphql/queries/clientPaymentQueries";
import { GET_CLIENTS } from "../../graphql/queries/userQueries";
import {
	CREATE_CLIENT_PAYMENT,
	UPDATE_CLIENT_PAYMENT,
	DELETE_CLIENT_PAYMENT,
} from "../../graphql/mutations/clientPaymentMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import {
	BsPlus,
	BsPencil,
	BsTrash,
	BsFileText,
	BsPerson,
} from "react-icons/bs";
import { formatCRC, formatDate, formatUSD } from "../../utils/formatters";
import ImageUploader from "../../components/cars/ImageUploader";
import CarSearchSelect from "../../components/cars/CarSearchSelect";
import Badge from "../../components/ui/Badge";

const ClientPaymentsManagementPage = () => {
	const { toast } = useToast();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingPayment, setEditingPayment] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [formData, setFormData] = useState({
		client: "",
		car: "",
		amount: "",
		paymentDate: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0],
		paymentMethod: "",
		pendingBalance: "",
		currency: "CRC",
	});

	const [receipt, setReceipt] = useState([]);

	const {
		data: paymentsData,
		loading,
		refetch,
	} = useQuery(GET_CLIENT_PAYMENTS);
	const { data: clientsData } = useQuery(GET_CLIENTS);

	const [createClientPayment] = useMutation(CREATE_CLIENT_PAYMENT);
	const [updateClientPayment] = useMutation(UPDATE_CLIENT_PAYMENT);
	const [deleteClientPayment] = useMutation(DELETE_CLIENT_PAYMENT);

	const payments = paymentsData?.clientPayments || [];
	const clients = clientsData?.clients || [];

	const clientOptions = clients.map((c) => ({
		value: c._id,
		label: `${c.name} (${c.email})`,
	}));

	const handleCreate = async (e) => {
		e.preventDefault();

		if (!formData.car) {
			toast.error("Debes seleccionar un auto");
			return;
		}

		try {
			await createClientPayment({
				variables: {
					input: {
						client: formData.client,
						car: formData.car || undefined,
						amount: Number(formData.amount),
						currency: formData.currency || "CRC",
						paymentDate: formData.paymentDate,
						paymentMethod: formData.paymentMethod || undefined,
						pendingBalance: formData.pendingBalance
							? Number(formData.pendingBalance)
							: undefined,
						receipt: formData.receipt || undefined,
					},
				},
			});
			toast.success("Pago de cliente registrado exitosamente");
			setIsCreateModalOpen(false);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al registrar pago");
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		if (!editingPayment) return;

		if (!formData.car) {
			toast.error("Debes seleccionar un auto");
			return;
		}

		try {
			await updateClientPayment({
				variables: {
					id: editingPayment._id,
					input: {
						amount: Number(formData.amount),
						paymentDate: formData.paymentDate,
						currency: formData.currency || "CRC",
						paymentMethod: formData.paymentMethod || undefined,
						pendingBalance: formData.pendingBalance
							? Number(formData.pendingBalance)
							: undefined,
						receipt: formData.receipt || undefined,
					},
				},
			});
			toast.success("Pago actualizado exitosamente");
			setEditingPayment(null);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al actualizar pago");
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteClientPayment({ variables: { id } });
			toast.success("Pago eliminado exitosamente");
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al eliminar pago");
		}
		setDeleteConfirm(null);
	};

	const openEditModal = (payment) => {
		setEditingPayment(payment);
		setFormData({
			client: payment.client?._id || "",
			car: payment.car?._id || "",
			amount: payment.amount?.toString() || "",
			paymentDate: payment.paymentDate
				? payment.paymentDate.split("T")[0]
				: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
			paymentMethod: payment.paymentMethod || "",
			pendingBalance: payment.pendingBalance?.toString() || "",
			currency: payment.currency || "CRC",
		});
		setReceipt(payment.receipt ? [payment.receipt] : []);
	};

	const resetForm = () => {
		setFormData({
			client: "",
			car: "",
			amount: "",
			paymentDate: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			paymentMethod: "",
			pendingBalance: "",
			currency: "CRC",
		});
		setReceipt([]);
	};

	const handleReceiptChange = (images) => {
		setReceipt(images);
		setFormData((p) => ({ ...p, receipt: images[0] || "" }));
	};

	const paymentMethodOptions = [
		{ value: "Transfer", label: "Transferencia" },
		{ value: "Cash", label: "Efectivo" },
		{ value: "Card", label: "Tarjeta" },
		{ value: "Check", label: "Cheque" },
	];

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando pagos..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">Pagos de Clientes</h1>
						<p className="text-first/50 mt-1">
							{payments.length} pagos registrados
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => setIsCreateModalOpen(true)}
					>
						Nuevo pago
					</Button>
				</div>

				{payments.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{payments.map((payment) => (
							<div
								key={payment._id}
								className="bg-main rounded-2xl border border-first/10 hover:shadow-lg hover:border-second/20 transition-all duration-200"
							>
								<div className="p-4">
									<div className="flex items-center gap-2 mb-2">
										<div className="w-8 h-8 rounded-full bg-first/5 flex items-center justify-center shrink-0">
											<BsPerson className="w-4 h-4 text-first/30" />
										</div>
										<p className="text-sm font-medium text-first truncate">
											{payment.client?.name}
										</p>
									</div>
									<p className="text-xs text-first/40 mb-2 truncate">
										{payment.car?.brand?.name} {payment.car?.carModel?.name}{" "}
										{payment.car?.year}
									</p>
									<p className="text-xl font-bold text-second mb-1">
										{payment.currency === "USD"
											? formatUSD(payment.amount)
											: formatCRC(payment.amount)}
									</p>
									{payment.pendingBalance > 0 && (
										<Badge variant="warning" size="sm" className="mb-2">
											Pendiente: {formatCRC(payment.pendingBalance)}
										</Badge>
									)}
									<div className="flex items-center justify-between pt-3 border-t border-first/5">
										<p className="text-xs text-first/40">
											{formatDate(payment.paymentDate)}
										</p>
										<p className="text-xs text-first/40">
											{payment.paymentMethod || "—"}
										</p>
									</div>
								</div>
								<div className="px-4 pb-3 flex gap-1 justify-end border-t border-first/5 pt-2">
									{payment.receipt && (
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											className="text-second"
											icon={<BsFileText className="w-3.5 h-3.5" />}
											onClick={() => window.open(payment.receipt, "_blank")}
											title="Ver comprobante"
										/>
									)}
									<Button
										iconOnly
										variant="ghost"
										size="sm"
										icon={<BsPencil className="w-3.5 h-3.5" />}
										onClick={() => openEditModal(payment)}
									/>
									<Button
										iconOnly
										variant="ghost"
										size="sm"
										className="text-error"
										icon={<BsTrash className="w-3.5 h-3.5" />}
										onClick={() => setDeleteConfirm(payment._id)}
									/>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						title="No hay pagos de clientes registrados"
						description="Registra un nuevo pago de cliente para comenzar."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsCreateModalOpen(true)}
							>
								Nuevo pago
							</Button>
						}
					/>
				)}

				{/* Create/Edit Modal */}
				<Modal
					isOpen={isCreateModalOpen || !!editingPayment}
					onClose={() => {
						setIsCreateModalOpen(false);
						setEditingPayment(null);
						resetForm();
					}}
					title={
						editingPayment ? "Editar Pago de Cliente" : "Nuevo Pago de Cliente"
					}
					size="lg"
				>
					<form
						onSubmit={editingPayment ? handleUpdate : handleCreate}
						className="space-y-4"
					>
						<Select
							label="Cliente"
							required
							options={clientOptions}
							value={formData.client}
							onChange={(e) =>
								setFormData((p) => ({ ...p, client: e.target.value }))
							}
							disabled={!!editingPayment}
							placeholder="Seleccionar cliente..."
						/>
						<CarSearchSelect
							value={formData.car}
							onChange={(id) => setFormData((p) => ({ ...p, car: id }))}
							disabled={!!editingPayment}
						/>
						<Select
							label="Moneda"
							size="sm"
							options={[
								{ value: "CRC", label: "CRC - Colones" },
								{ value: "USD", label: "USD - Dólares" },
							]}
							value={formData.currency || "CRC"}
							onChange={(e) =>
								setFormData((p) => ({ ...p, currency: e.target.value }))
							}
						/>
						<div className="grid grid-cols-2 gap-4">
							<Input
								label="Monto"
								type="number"
								required
								min={0}
								value={formData.amount}
								onChange={(e) =>
									setFormData((p) => ({ ...p, amount: e.target.value }))
								}
							/>
							<Input
								label="Fecha del pago"
								type="date"
								required
								value={formData.paymentDate}
								onChange={(e) =>
									setFormData((p) => ({ ...p, paymentDate: e.target.value }))
								}
							/>
						</div>
						<Select
							label="Método de pago"
							options={paymentMethodOptions}
							value={formData.paymentMethod}
							onChange={(e) =>
								setFormData((p) => ({ ...p, paymentMethod: e.target.value }))
							}
							placeholder="Seleccionar método..."
						/>
						<ImageUploader
							images={receipt}
							onImagesChange={handleReceiptChange}
							maxImages={1}
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setIsCreateModalOpen(false);
									setEditingPayment(null);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button type="submit">
								{editingPayment ? "Guardar cambios" : "Registrar pago"}
							</Button>
						</div>
					</form>
				</Modal>

				{/* Delete Confirmation */}
				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar pago de cliente"
					description="¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer."
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default ClientPaymentsManagementPage;
