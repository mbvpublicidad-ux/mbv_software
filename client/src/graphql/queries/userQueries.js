import gql from "graphql-tag";

export const GET_ME = gql`
	query Me {
		me {
			_id
			name
			email
			role
			phone
			address
			isDirectBuyer
			active
			temporaryPassword
			commissionedCars {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				year
				color
				logisticStatus
				images
			}
		}
	}
`;

export const GET_USERS = gql`
	query Users {
		users {
			_id
			name
			email
			role
			phone
			address
			isDirectBuyer
			active
			temporaryPassword
			registrationDate
		}
	}
`;

export const GET_USER = gql`
	query User($id: ID!) {
		user(id: $id) {
			_id
			name
			email
			role
			phone
			address
			isDirectBuyer
			active
			temporaryPassword
			commissionedCars {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				year
				color
			}
		}
	}
`;

export const GET_CLIENTS = gql`
	query Clients {
		clients {
			_id
			name
			email
			phone
			address
			isDirectBuyer
			active
			registrationDate
			temporaryPassword
			commissionedCars {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				year
				vin
			}
		}
	}
`;
