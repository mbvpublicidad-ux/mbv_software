/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_EXPENSES } from "../graphql/queries/expenseQueries";
import {
	GET_JC_PAYMENTS,
	GET_JC_DEBT_SUMMARY,
} from "../graphql/queries/jcPaymentQueries";
import { GET_CLIENT_PAYMENTS } from "../graphql/queries/clientPaymentQueries";
import {
	CREATE_EXPENSE,
	UPDATE_EXPENSE,
	DELETE_EXPENSE,
} from "../graphql/mutations/expenseMutations";
import {
	CREATE_GENERAL_EXPENSE,
	UPDATE_GENERAL_EXPENSE,
	DELETE_GENERAL_EXPENSE,
} from "../graphql/mutations/generalExpenseMutations";
import {
	CREATE_JC_PAYMENT,
	UPDATE_JC_PAYMENT,
	DELETE_JC_PAYMENT,
} from "../graphql/mutations/jcPaymentMutations";
import {
	CREATE_CLIENT_PAYMENT,
	UPDATE_CLIENT_PAYMENT,
	DELETE_CLIENT_PAYMENT,
} from "../graphql/mutations/clientPaymentMutations";
import { GET_GENERAL_EXPENSES } from "../graphql/queries/generalExpenseQueries";

const ExpensesContext = createContext(null);

export const ExpensesProvider = ({ children }) => {
	// Queries
	const {
		data: expensesData,
		loading: expensesLoading,
		refetch: refetchExpenses,
	} = useQuery(GET_EXPENSES);
	const {
		data: generalExpensesData,
		loading: generalExpensesLoading,
		refetch: refetchGeneralExpenses,
	} = useQuery(GET_GENERAL_EXPENSES);
	const {
		data: jcPaymentsData,
		loading: jcPaymentsLoading,
		refetch: refetchJCPayments,
	} = useQuery(GET_JC_PAYMENTS);
	const {
		data: jcDebtSummaryData,
		loading: jcDebtSummaryLoading,
		refetch: refetchJCDebtSummary,
	} = useQuery(GET_JC_DEBT_SUMMARY);
	const {
		data: clientPaymentsData,
		loading: clientPaymentsLoading,
		refetch: refetchClientPayments,
	} = useQuery(GET_CLIENT_PAYMENTS);

	// Expense Mutations
	const [createExpenseMutation] = useMutation(CREATE_EXPENSE);
	const [updateExpenseMutation] = useMutation(UPDATE_EXPENSE);
	const [deleteExpenseMutation] = useMutation(DELETE_EXPENSE);

	// General Expense Mutations
	const [createGeneralExpenseMutation] = useMutation(CREATE_GENERAL_EXPENSE);
	const [updateGeneralExpenseMutation] = useMutation(UPDATE_GENERAL_EXPENSE);
	const [deleteGeneralExpenseMutation] = useMutation(DELETE_GENERAL_EXPENSE);

	// JC Payment Mutations
	const [createJCPaymentMutation] = useMutation(CREATE_JC_PAYMENT);
	const [updateJCPaymentMutation] = useMutation(UPDATE_JC_PAYMENT);
	const [deleteJCPaymentMutation] = useMutation(DELETE_JC_PAYMENT);

	// Client Payment Mutations
	const [createClientPaymentMutation] = useMutation(CREATE_CLIENT_PAYMENT);
	const [updateClientPaymentMutation] = useMutation(UPDATE_CLIENT_PAYMENT);
	const [deleteClientPaymentMutation] = useMutation(DELETE_CLIENT_PAYMENT);

	// Refetch all
	const refetchAll = useCallback(async () => {
		await Promise.all([
			refetchExpenses(),
			refetchGeneralExpenses(),
			refetchJCPayments(),
			refetchJCDebtSummary(),
			refetchClientPayments(),
		]);
	}, [
		refetchExpenses,
		refetchGeneralExpenses,
		refetchJCPayments,
		refetchJCDebtSummary,
		refetchClientPayments,
	]);

	const value = {
		// Data
		expenses: expensesData?.expenses || [],
		generalExpenses: generalExpensesData?.generalExpenses || [],
		jcPayments: jcPaymentsData?.jcPayments || [],
		jcDebtSummary: jcDebtSummaryData?.jcDebtSummary,
		clientPayments: clientPaymentsData?.clientPayments || [],
		// Loading states
		expensesLoading,
		generalExpensesLoading,
		jcPaymentsLoading,
		jcDebtSummaryLoading,
		clientPaymentsLoading,
		// Refetch
		refetchAll,
		refetchExpenses,
		refetchGeneralExpenses,
		refetchJCPayments,
		refetchJCDebtSummary,
		refetchClientPayments,
		// Expense mutations
		createExpense: (input) => createExpenseMutation({ variables: { input } }),
		updateExpense: (id, input) =>
			updateExpenseMutation({ variables: { id, input } }),
		deleteExpense: (id) => deleteExpenseMutation({ variables: { id } }),
		// General expense mutations
		createGeneralExpense: (input) =>
			createGeneralExpenseMutation({ variables: { input } }),
		updateGeneralExpense: (id, input) =>
			updateGeneralExpenseMutation({ variables: { id, input } }),
		deleteGeneralExpense: (id) =>
			deleteGeneralExpenseMutation({ variables: { id } }),
		// JC Payment mutations
		createJCPayment: (input) =>
			createJCPaymentMutation({ variables: { input } }),
		updateJCPayment: (id, input) =>
			updateJCPaymentMutation({ variables: { id, input } }),
		deleteJCPayment: (id) => deleteJCPaymentMutation({ variables: { id } }),
		// Client Payment mutations
		createClientPayment: (input) =>
			createClientPaymentMutation({ variables: { input } }),
		updateClientPayment: (id, input) =>
			updateClientPaymentMutation({ variables: { id, input } }),
		deleteClientPayment: (id) =>
			deleteClientPaymentMutation({ variables: { id } }),
	};

	return (
		<ExpensesContext.Provider value={value}>
			{children}
		</ExpensesContext.Provider>
	);
};

export const useExpenses = () => {
	const context = useContext(ExpensesContext);
	if (!context)
		throw new Error("useExpenses must be used within ExpensesProvider");
	return context;
};
