import gql from "graphql-tag";

export const GET_COMPANY_BALANCE = gql`
	query CompanyBalance {
		companyBalance {
			_id
			initialAmount
			currentBalance
			lastUpdated
			updatedBy {
				_id
				name
			}
		}
	}
`;
