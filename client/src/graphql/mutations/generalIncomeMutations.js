import gql from "graphql-tag";

export const CREATE_GENERAL_INCOME = gql`
	mutation CreateGeneralIncome($input: GeneralIncomeInput!) {
		createGeneralIncome(input: $input) {
			_id
			concept
			amount
			currency
			incomeDate
			description
			receipt
			createdAt
		}
	}
`;

export const UPDATE_GENERAL_INCOME = gql`
	mutation UpdateGeneralIncome($id: ID!, $input: UpdateGeneralIncomeInput!) {
		updateGeneralIncome(id: $id, input: $input) {
			_id
			concept
			amount
			currency
			incomeDate
			description
		}
	}
`;

export const DELETE_GENERAL_INCOME = gql`
	mutation DeleteGeneralIncome($id: ID!) {
		deleteGeneralIncome(id: $id)
	}
`;
