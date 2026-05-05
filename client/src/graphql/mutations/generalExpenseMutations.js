import gql from "graphql-tag";

export const CREATE_GENERAL_EXPENSE = gql`
	mutation CreateGeneralExpense($input: GeneralExpenseInput!) {
		createGeneralExpense(input: $input) {
			_id
			concept
			amount
			paidFrom
			currency
			expenseDate
			receipt
			description
			createdAt
		}
	}
`;

export const UPDATE_GENERAL_EXPENSE = gql`
	mutation UpdateGeneralExpense($id: ID!, $input: UpdateGeneralExpenseInput!) {
		updateGeneralExpense(id: $id, input: $input) {
			_id
			concept
			amount
			paidFrom
			currency
			expenseDate
			description
		}
	}
`;

export const DELETE_GENERAL_EXPENSE = gql`
	mutation DeleteGeneralExpense($id: ID!) {
		deleteGeneralExpense(id: $id)
	}
`;
