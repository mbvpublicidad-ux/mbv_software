import gql from "graphql-tag";

export const UPDATE_EXCHANGE_RATE = gql`
	mutation UpdateExchangeRate($value: Float!) {
		updateExchangeRate(value: $value) {
			_id
			value
			updateDate
			updatedBy {
				_id
				name
			}
		}
	}
`;
