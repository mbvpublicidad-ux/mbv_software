import gql from "graphql-tag";

export const CREATE_CLIENT_PAYMENT = gql`
	mutation CreateClientPayment($input: ClientPaymentInput!) {
		createClientPayment(input: $input) {
			_id
			client {
				_id
				name
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
			currency
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

export const UPDATE_CLIENT_PAYMENT = gql`
	mutation UpdateClientPayment($id: ID!, $input: UpdateClientPaymentInput!) {
		updateClientPayment(id: $id, input: $input) {
			_id
			amount
			currency
			paymentDate
			paymentMethod
			pendingBalance
		}
	}
`;

export const DELETE_CLIENT_PAYMENT = gql`
	mutation DeleteClientPayment($id: ID!) {
		deleteClientPayment(id: $id)
	}
`;
