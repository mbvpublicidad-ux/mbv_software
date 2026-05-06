import gql from "graphql-tag";

const carEstimateDefs = gql`
	type CarEstimate {
		_id: ID!
		car: Car!
		estimatedTaxes: Float
		estimatedVAT: Float
		estimatedRegistration: Float
		updatedAt: String
	}

	input CarEstimateInput {
		car: ID!
		estimatedTaxes: Float
		estimatedVAT: Float
		estimatedRegistration: Float
	}

	type Query {
		carEstimates: [CarEstimate!]!
	}

	type Mutation {
		saveCarEstimate(input: CarEstimateInput!): CarEstimate!
	}
`;

export default carEstimateDefs;
