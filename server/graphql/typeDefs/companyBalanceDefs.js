import gql from "graphql-tag";

const companyBalanceDefs = gql`
	type CompanyBalance {
		_id: ID!
		initialAmount: Float!
		currentBalance: Float!
		lastUpdated: String!
		updatedBy: User
	}

	type Query {
		companyBalance: CompanyBalance!
	}

	type Mutation {
		updateInitialAmount(amount: Float!): CompanyBalance!
	}
`;

export default companyBalanceDefs;
