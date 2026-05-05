import gql from "graphql-tag";

const companyBalanceDefs = gql`
	type CompanyBalance {
		_id: ID!
		initialAmountCRC: Float!
		initialAmountUSD: Float!
		currentBalanceCRC: Float!
		currentBalanceUSD: Float!
		lastUpdated: String!
		updatedBy: User
	}

	type Query {
		companyBalance: CompanyBalance!
	}

	type Mutation {
		updateInitialAmountCRC(amount: Float!): CompanyBalance!
		updateInitialAmountUSD(amount: Float!): CompanyBalance!
		recalculateBalance: CompanyBalance!
	}
`;

export default companyBalanceDefs;
