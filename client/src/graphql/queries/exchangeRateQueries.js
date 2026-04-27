import gql from "graphql-tag";

export const GET_EXCHANGE_RATE = gql`
	query ExchangeRate {
		exchangeRate {
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
