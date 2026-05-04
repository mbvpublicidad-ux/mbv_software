import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_GENERAL_EXPENSES } from "../../graphql/queries/generalExpenseQueries";
import { DELETE_GENERAL_EXPENSE } from "../../graphql/mutations/generalExpenseMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import GeneralExpenseForm from "../../components/expenses/GeneralExpenseForm";
import { BsPlus, BsPencil, BsTrash, BsFileText } from "react-icons/bs";
import { formatCRC, formatUSD, formatDate } from "../../utils/formatters";

const GeneralExpensesPage = () => {
	const { toast } = useToast();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const { data, loading, refetch } = useQuery(GET_GENERAL_EXPENSES);
	const [deleteExpense] = useMutation(DELETE_GENERAL_EXPENSE);

	const expenses = data?.generalExpenses || [];

	const handleDelete = async (id) => {
		try {
			await deleteExpense({ variables: { id } });
			toast.success("Gasto eliminado");
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
		setDeleteConfirm(null);
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando gastos..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">Gastos Generales</h1>
						<p className="text-first/50 mt-1">
							{expenses.length} gastos
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => {
							setEditingExpense(null);
							setIsFormOpen(true);
						}}
					>
						Nuevo gasto
					</Button>
				</div>

				{expenses.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{expenses.map((expense) => (
							<div
								key={expense._id}
								className="bg-main rounded-2xl border border-first/10 hover:shadow-lg hover:border-second/20 transition-all duration-200"
							>
								<div className="p-4">
									<p className="text-sm font-medium text-first truncate mb-2">
										{expense.concept}
									</p>
									{expense.description && (
										<p className="text-xs text-first/40 mb-3 truncate">
											{expense.description}
										</p>
									)}
									<div className="flex items-center justify-between pt-3 border-t border-first/5">
										<p className="text-lg font-bold text-second">
											{expense.currency === "CRC"
												? formatCRC(expense.amount)
												: formatUSD(expense.amount)}
										</p>
										<p className="text-xs text-first/40">
											{formatDate(expense.expenseDate)}
										</p>
									</div>
								</div>
								<div className="px-4 pb-3 flex gap-1 justify-end border-t border-first/5 pt-2">
									{expense.receipt && (
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											className="text-second"
											icon={<BsFileText className="w-3.5 h-3.5" />}
											onClick={() => window.open(expense.receipt, "_blank")}
											title="Ver comprobante"
										/>
									)}
									<Button
										iconOnly
										variant="ghost"
										size="sm"
										icon={<BsPencil className="w-3.5 h-3.5" />}
										onClick={() => {
											setEditingExpense(expense);
											setIsFormOpen(true);
										}}
									/>
									<Button
										iconOnly
										variant="ghost"
										size="sm"
										className="text-error"
										icon={<BsTrash className="w-3.5 h-3.5" />}
										onClick={() => setDeleteConfirm(expense._id)}
									/>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						title="No hay gastos generales"
						description="Crea un nuevo gasto general para comenzar."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsFormOpen(true)}
							>
								Nuevo gasto
							</Button>
						}
					/>
				)}

				<Modal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false);
						setEditingExpense(null);
					}}
					title={
						editingExpense ? "Editar Gasto General" : "Nuevo Gasto General"
					}
					size="md"
				>
					<GeneralExpenseForm
						expense={editingExpense}
						onClose={() => {
							setIsFormOpen(false);
							setEditingExpense(null);
						}}
						onSuccess={() => refetch()}
					/>
				</Modal>

				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar gasto general"
					description="¿Estás seguro?"
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default GeneralExpensesPage;
