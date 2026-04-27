import gql from "graphql-tag";

export const LOGIN = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			token
			user {
				_id
				name
				email
				role
				phone
				address
				isDirectBuyer
				temporaryPassword
			}
		}
	}
`;

export const LOGOUT = gql`
	mutation Logout {
		logout
	}
`;

export const REGISTER = gql`
	mutation Register($input: UserInput!) {
		register(input: $input) {
			token
			user {
				_id
				name
				email
				role
			}
		}
	}
`;

export const CREATE_USER = gql`
	mutation CreateUser($input: UserInput!) {
		createUser(input: $input) {
			_id
			name
			email
			role
			phone
			address
			isDirectBuyer
			active
			temporaryPassword
		}
	}
`;

export const UPDATE_USER = gql`
	mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
		updateUser(id: $id, input: $input) {
			_id
			name
			email
			role
			phone
			address
			isDirectBuyer
			active
		}
	}
`;

export const DELETE_USER = gql`
	mutation DeleteUser($id: ID!) {
		deleteUser(id: $id)
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input)
	}
`;

export const FORGOT_PASSWORD = gql`
	mutation ForgotPassword($email: String!) {
		forgotPassword(email: $email)
	}
`;

export const RESET_PASSWORD = gql`
	mutation ResetPassword($input: ResetPasswordInput!) {
		resetPassword(input: $input)
	}
`;

export const ASSIGN_CAR_TO_CLIENT = gql`
	mutation AssignCarToClient($userId: ID!, $carId: ID!) {
		assignCarToClient(userId: $userId, carId: $carId) {
			_id
			commissionedCars {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				year
			}
		}
	}
`;

export const REMOVE_CAR_FROM_CLIENT = gql`
	mutation RemoveCarFromClient($userId: ID!, $carId: ID!) {
		removeCarFromClient(userId: $userId, carId: $carId) {
			_id
			commissionedCars {
				_id
			}
		}
	}
`;
