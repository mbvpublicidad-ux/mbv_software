import gql from "graphql-tag";

export const CREATE_JC_PAYMENT = gql`
	mutation CreateJCPayment($input: JCPaymentInput!) {
		createJCPayment(input: $input) {
			_id
			amount
			actualPaymentDate
			registrationDate
			concept
			associatedCars {
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
			}
			receipt
			transferReference
			createdBy {
				_id
				name
			}
		}
	}
`;

export const UPDATE_JC_PAYMENT = gql`
	mutation UpdateJCPayment($id: ID!, $input: UpdateJCPaymentInput!) {
		updateJCPayment(id: $id, input: $input) {
			_id
			amount
			actualPaymentDate
			concept
			associatedCars {
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
			}
		}
	}
`;

export const DELETE_JC_PAYMENT = gql`
	mutation DeleteJCPayment($id: ID!) {
		deleteJCPayment(id: $id)
	}
`;
