import gql from "graphql-tag";

export const GET_CAR_ESTIMATES = gql`
	query CarEstimates {
		carEstimates {
			_id
			car {
				_id
			}
			estimatedTaxes
			estimatedVAT
			estimatedRegistration
		}
	}
`;
