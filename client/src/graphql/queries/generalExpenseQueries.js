import gql from "graphql-tag";

export const GET_GENERAL_EXPENSES = gql`
	query GeneralExpenses($startDate: String, $endDate: String) {
		generalExpenses(startDate: $startDate, endDate: $endDate) {
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
