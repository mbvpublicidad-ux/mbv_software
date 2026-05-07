import gql from "graphql-tag";

const generalIncomeDefs = gql`
	type GeneralIncome {
		_id: ID!
		concept: String!
		amount: Float!
		currency: String!
		incomeDate: String!
		description: String
		receipt: String
		createdBy: User!
		createdAt: String!
	}

	input GeneralIncomeInput {
		concept: String!
		amount: Float!
		currency: String!
		incomeDate: String!
		description: String
		receipt: String
	}

	input UpdateGeneralIncomeInput {
		concept: String
		amount: Float
		currency: String
		incomeDate: String
		description: String
		receipt: String
	}

	type Query {
		generalIncomes: [GeneralIncome!]!
		generalIncome(id: ID!): GeneralIncome
	}

	type Mutation {
		createGeneralIncome(input: GeneralIncomeInput!): GeneralIncome!
		updateGeneralIncome(
			id: ID!
			input: UpdateGeneralIncomeInput!
		): GeneralIncome!
		deleteGeneralIncome(id: ID!): Boolean!
	}
`;

export default generalIncomeDefs;
