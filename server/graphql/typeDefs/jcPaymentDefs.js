import gql from "graphql-tag";

const jcPaymentDefs = gql`
	type JCPayment {
		_id: ID!
		amount: Float!
		actualPaymentDate: String!
		registrationDate: String!
		concept: String
		associatedCars: [Car]
		receipt: String
		transferReference: String
		createdBy: User!
		updatedBy: User
		updatable: Boolean!
	}

	input JCPaymentInput {
		amount: Float!
		actualPaymentDate: String!
		concept: String
		associatedCars: [ID]
		receipt: String
		transferReference: String
	}

	input UpdateJCPaymentInput {
		amount: Float
		actualPaymentDate: String
		concept: String
		associatedCars: [ID]
		receipt: String
		transferReference: String
	}

	type JCDebtSummary {
		totalInvestedUSD: Float!
		totalPaidUSD: Float!
		totalPendingUSD: Float!
		payments: [JCPayment!]!
	}

	type Query {
		jcPayments(
			page: Int
			limit: Int
			startDate: String
			endDate: String
			carId: ID
		): [JCPayment!]!
		jcPayment(id: ID!): JCPayment
		jcDebtSummary: JCDebtSummary!
	}

	type Mutation {
		createJCPayment(input: JCPaymentInput!): JCPayment!
		updateJCPayment(id: ID!, input: UpdateJCPaymentInput!): JCPayment!
		deleteJCPayment(id: ID!): Boolean!
	}
`;

export default jcPaymentDefs;
