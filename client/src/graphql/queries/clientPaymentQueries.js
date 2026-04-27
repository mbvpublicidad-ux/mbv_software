import gql from "graphql-tag";

export const GET_CLIENT_PAYMENTS = gql`
	query ClientPayments($clientId: ID, $carId: ID) {
		clientPayments(clientId: $clientId, carId: $carId) {
			_id
			client {
				_id
				name
				email
			}
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
			amount
			paymentDate
			paymentMethod
			pendingBalance
			receipt
			createdBy {
				_id
				name
			}
			createdAt
		}
	}
`;
