import gql from "graphql-tag";

export const CREATE_EXPENSE = gql`
	mutation CreateExpense($input: ExpenseInput!) {
		createExpense(input: $input) {
			_id
			car {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				year
			}
			type
			description
			amount
			currency
			expenseDate
			receipt
			isFromJuanCarlos
			createdAt
		}
	}
`;

export const UPDATE_EXPENSE = gql`
	mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
		updateExpense(id: $id, input: $input) {
			_id
			type
			description
			amount
			currency
			expenseDate
			isFromJuanCarlos
		}
	}
`;

export const DELETE_EXPENSE = gql`
	mutation DeleteExpense($id: ID!) {
		deleteExpense(id: $id)
	}
`;
