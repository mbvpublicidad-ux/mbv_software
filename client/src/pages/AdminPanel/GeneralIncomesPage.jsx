import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_GENERAL_INCOMES } from "../../graphql/queries/generalIncomeQueries";
import {
	CREATE_GENERAL_INCOME,
	UPDATE_GENERAL_INCOME,
	DELETE_GENERAL_INCOME,
} from "../../graphql/mutations/generalIncomeMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import ImageUploader from "../../components/cars/ImageUploader";
import { BsPlus, BsPencil, BsTrash, BsFileText } from "react-icons/bs";
import { formatCRC, formatUSD, formatDate } from "../../utils/formatters";

const GeneralIncomesPage = () => {
	const { toast } = useToast();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingIncome, setEditingIncome] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [formData, setFormData] = useState({
		concept: "",
		amount: "",
		currency: "CRC",
		incomeDate: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0],
		description: "",
	});
	const [receipt, setReceipt] = useState([]);

	const { data, loading, refetch } = useQuery(GET_GENERAL_INCOMES);
	const [createIncome] = useMutation(CREATE_GENERAL_INCOME);
	const [updateIncome] = useMutation(UPDATE_GENERAL_INCOME);
	const [deleteIncome] = useMutation(DELETE_GENERAL_INCOME);

	const incomes = data?.generalIncomes || [];

	const handleSubmit = async (e) => {
		e.preventDefault();
		const variables = {
			input: {
				concept: formData.concept.trim(),
				amount: Number(formData.amount),
				currency: formData.currency,
				incomeDate: formData.incomeDate,
				description: formData.description.trim() || undefined,
				receipt: formData.receipt || undefined,
			},
		};

		try {
			if (editingIncome) {
				await updateIncome({
					variables: { id: editingIncome._id, input: variables.input },
				});
				toast.success("Ingreso actualizado");
			} else {
				await createIncome({ variables: { input: variables.input } });
				toast.success("Ingreso registrado");
			}
			setIsFormOpen(false);
			setEditingIncome(null);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteIncome({ variables: { id } });
			toast.success("Ingreso eliminado");
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
		setDeleteConfirm(null);
	};

	const openEdit = (income) => {
		setEditingIncome(income);
		setFormData({
			concept: income.concept || "",
			amount: income.amount?.toString() || "",
			currency: income.currency || "CRC",
			incomeDate: income.incomeDate ? income.incomeDate.split("T")[0] : "",
			description: income.description || "",
			receipt: income.receipt || "",
		});
		setReceipt(income.receipt ? [income.receipt] : []);
	};

	const resetForm = () => {
		setFormData({
			concept: "",
			amount: "",
			currency: "CRC",
			incomeDate: new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			description: "",
		});
		setReceipt([]);
	};

	if (loading) return <LoadingOverlay visible={true} text="Cargando..." />;

	return (
		<div className="min-h-screen pb-16">
			<div className="px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">
							Ingresos Generales
						</h1>
						<p className="text-first/50 mt-1">
							{incomes.length} ingresos registrados
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => {
							setEditingIncome(null);
							setIsFormOpen(true);
						}}
					>
						Nuevo ingreso
					</Button>
				</div>

				{incomes.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{incomes.map((income) => (
							<div
								key={income._id}
								className="bg-main rounded-2xl border border-first/10 hover:shadow-lg transition-all"
							>
								<div className="p-4">
									<p className="text-sm font-medium text-first truncate mb-2">
										{income.concept}
									</p>
									{income.description && (
										<p className="text-xs text-first/40 mb-3 truncate">
											{income.description}
										</p>
									)}
									<div className="flex items-center justify-between pt-3 border-t border-first/5">
										<p className="text-lg font-bold text-success">
											{income.currency === "CRC"
												? formatCRC(income.amount)
												: formatUSD(income.amount)}
										</p>
										<p className="text-xs text-first/40">
											{formatDate(income.incomeDate)}
										</p>
									</div>
								</div>
								<div className="px-4 pb-3 flex gap-1 justify-end border-t border-first/5 pt-2">
									{income.receipt && (
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											className="text-second"
											icon={<BsFileText className="w-3.5 h-3.5" />}
											onClick={() => window.open(income.receipt, "_blank")}
											title="Ver comprobante"
										/>
									)}
									<Button
										iconOnly
										variant="ghost"
										size="sm"
										icon={<BsPencil className="w-3.5 h-3.5" />}
										onClick={() => {
											openEdit(income);
											setIsFormOpen(true);
										}}
									/>
									<Button
										iconOnly
										variant="ghost"
										size="sm"
										className="text-error"
										icon={<BsTrash className="w-3.5 h-3.5" />}
										onClick={() => setDeleteConfirm(income._id)}
									/>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						title="No hay ingresos registrados"
						description="Registra un nuevo ingreso general."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsFormOpen(true)}
							>
								Nuevo ingreso
							</Button>
						}
					/>
				)}

				<Modal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false);
						setEditingIncome(null);
						resetForm();
					}}
					title={editingIncome ? "Editar Ingreso" : "Nuevo Ingreso"}
					size="md"
				>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							label="Concepto"
							required
							value={formData.concept}
							onChange={(e) =>
								setFormData((p) => ({ ...p, concept: e.target.value }))
							}
							placeholder="Ej: Aporte de socio"
							size="sm"
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
								size="sm"
							/>
							<Select
								label="Moneda"
								options={[
									{ value: "CRC", label: "CRC" },
									{ value: "USD", label: "USD" },
								]}
								value={formData.currency}
								onChange={(e) =>
									setFormData((p) => ({ ...p, currency: e.target.value }))
								}
								size="sm"
							/>
						</div>
						<Input
							label="Fecha"
							type="date"
							required
							value={formData.incomeDate}
							onChange={(e) =>
								setFormData((p) => ({ ...p, incomeDate: e.target.value }))
							}
							size="sm"
						/>
						<Input
							label="Descripción (opcional)"
							value={formData.description}
							onChange={(e) =>
								setFormData((p) => ({ ...p, description: e.target.value }))
							}
							size="sm"
						/>
						<ImageUploader
							images={receipt}
							onImagesChange={(imgs) => {
								setReceipt(imgs);
								setFormData((p) => ({ ...p, receipt: imgs[0] || "" }));
							}}
							maxImages={1}
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setIsFormOpen(false);
									setEditingIncome(null);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button type="submit">
								{editingIncome ? "Guardar cambios" : "Registrar ingreso"}
							</Button>
						</div>
					</form>
				</Modal>

				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar ingreso"
					description="¿Estás seguro?"
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default GeneralIncomesPage;
