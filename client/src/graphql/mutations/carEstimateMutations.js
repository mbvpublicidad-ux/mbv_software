import gql from "graphql-tag";

export const SAVE_CAR_ESTIMATE = gql`
	mutation SaveCarEstimate($input: CarEstimateInput!) {
		saveCarEstimate(input: $input) {
			_id
			estimatedTaxes
			estimatedVAT
			estimatedRegistration
		}
	}
`;
