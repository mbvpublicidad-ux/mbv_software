import gql from "graphql-tag";

export const UPDATE_INITIAL_AMOUNT = gql`
	mutation UpdateInitialAmount($amount: Float!) {
		updateInitialAmount(amount: $amount) {
			_id
			initialAmount
			currentBalance
			lastUpdated
		}
	}
`;
