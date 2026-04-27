import gql from "graphql-tag";

const clientPaymentDefs = gql`
	type ClientPayment {
		_id: ID!
		client: User!
		car: Car!
		amount: Float!
		paymentDate: String!
		paymentMethod: String
		pendingBalance: Float
		receipt: String
		createdBy: User!
		createdAt: String!
	}

	input ClientPaymentInput {
		client: ID!
		car: ID!
		amount: Float!
		paymentDate: String!
		paymentMethod: String
		pendingBalance: Float
		receipt: String
	}

	input UpdateClientPaymentInput {
		amount: Float
		paymentDate: String
		paymentMethod: String
		pendingBalance: Float
		receipt: String
	}

	type Query {
		clientPayments(
			clientId: ID
			carId: ID
			page: Int
			limit: Int
		): [ClientPayment!]!
		clientPayment(id: ID!): ClientPayment
	}

	type Mutation {
		createClientPayment(input: ClientPaymentInput!): ClientPayment!
		updateClientPayment(
			id: ID!
			input: UpdateClientPaymentInput!
		): ClientPayment!
		deleteClientPayment(id: ID!): Boolean!
	}
`;

export default clientPaymentDefs;
