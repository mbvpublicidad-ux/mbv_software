import gql from "graphql-tag";

export const GET_GENERAL_INCOMES = gql`
	query GeneralIncomes {
		generalIncomes {
			_id
			concept
			amount
			currency
			incomeDate
			description
			receipt
			createdBy {
				_id
				name
			}
			createdAt
		}
	}
`;
