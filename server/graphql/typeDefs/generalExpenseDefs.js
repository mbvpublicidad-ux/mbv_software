import gql from "graphql-tag";

const generalExpenseDefs = gql`
	type GeneralExpense {
		_id: ID!
		concept: String!
		amount: Float!
		currency: String!
		paidFrom: String
		expenseDate: String!
		receipt: String
		description: String
		createdAt: String!
	}

	input GeneralExpenseInput {
		concept: String!
		amount: Float!
		paidFrom: String
		currency: String!
		expenseDate: String!
		receipt: String
		description: String
	}

	input UpdateGeneralExpenseInput {
		concept: String
		amount: Float
		paidFrom: String
		currency: String
		expenseDate: String
		receipt: String
		description: String
	}

	type Query {
		generalExpenses(
			page: Int
			limit: Int
			startDate: String
			endDate: String
		): [GeneralExpense!]!
		generalExpense(id: ID!): GeneralExpense
	}

	type Mutation {
		createGeneralExpense(input: GeneralExpenseInput!): GeneralExpense!
		updateGeneralExpense(
			id: ID!
			input: UpdateGeneralExpenseInput!
		): GeneralExpense!
		deleteGeneralExpense(id: ID!): Boolean!
	}
`;

export default generalExpenseDefs;
