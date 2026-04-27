import gql from "graphql-tag";

const exchangeRateDefs = gql`
	type ExchangeRate {
		_id: ID!
		value: Float!
		updateDate: String!
		updatedBy: User
	}

	type Query {
		exchangeRate: ExchangeRate!
		exchangeRates: [ExchangeRate!]!
	}

	type Mutation {
		updateExchangeRate(value: Float!): ExchangeRate!
	}
`;

export default exchangeRateDefs;
