import gql from "graphql-tag";

const expenseDefs = gql`
	type Expense {
		_id: ID!
		car: Car!
		type: String!
		description: String
		amount: Float!
		currency: String!
		expenseDate: String!
		receipt: String
		isFromJuanCarlos: Boolean!
		createdAt: String!
	}

	input ExpenseInput {
		car: ID!
		type: String!
		description: String
		amount: Float!
		currency: String!
		expenseDate: String!
		receipt: String
		isFromJuanCarlos: Boolean!
	}

	input UpdateExpenseInput {
		type: String
		description: String
		amount: Float
		currency: String
		expenseDate: String
		receipt: String
		isFromJuanCarlos: Boolean
	}

	type Query {
		expenses(
			carId: ID
			isFromJuanCarlos: Boolean
			type: String
			page: Int
			limit: Int
		): [Expense!]!
		expense(id: ID!): Expense
		carExpensesSummary(carId: ID!): CarExpensesSummary!
	}

	type CarExpensesSummary {
		totalUSD: Float!
		totalCRC: Float!
		expenses: [Expense!]!
	}

	type Mutation {
		createExpense(input: ExpenseInput!): Expense!
		updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
		deleteExpense(id: ID!): Boolean!
	}
`;

export default expenseDefs;
