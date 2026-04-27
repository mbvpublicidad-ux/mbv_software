import gql from "graphql-tag";

const userDefs = gql`
	type User {
		_id: ID!
		name: String!
		email: String!
		role: String!
		phone: String
		address: String
		registrationDate: String!
		commissionedCars: [Car]
		isDirectBuyer: Boolean!
		active: Boolean!
		temporaryPassword: Boolean!
	}

	type AuthPayload {
		token: String!
		user: User!
	}

	input UserInput {
		name: String!
		email: String!
		password: String
		role: String
		phone: String
		address: String
		isDirectBuyer: Boolean
		active: Boolean
	}

	input UpdateUserInput {
		name: String
		email: String
		phone: String
		address: String
		isDirectBuyer: Boolean
		active: Boolean
		role: String
	}

	input ChangePasswordInput {
		currentPassword: String!
		newPassword: String!
	}

	input ResetPasswordInput {
		email: String!
		code: String!
		newPassword: String!
	}

	type Query {
		me: User
		users: [User!]!
		user(id: ID!): User
		clients: [User!]!
	}

	type Mutation {
		login(email: String!, password: String!): AuthPayload!
		logout: Boolean!
		register(input: UserInput!): AuthPayload!
		createUser(input: UserInput!): User!
		updateUser(id: ID!, input: UpdateUserInput!): User!
		deleteUser(id: ID!): Boolean!
		changePassword(input: ChangePasswordInput!): Boolean!
		forgotPassword(email: String!): Boolean!
		resetPassword(input: ResetPasswordInput!): Boolean!
		assignCarToClient(userId: ID!, carId: ID!): User!
		removeCarFromClient(userId: ID!, carId: ID!): User!
	}
`;

export default userDefs;
