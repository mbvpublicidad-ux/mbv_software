import gql from "graphql-tag";

export const GET_COMPANY_BALANCE = gql`
	query CompanyBalance {
		companyBalance {
			_id
			initialAmountCRC
			initialAmountUSD
			currentBalanceCRC
			currentBalanceUSD
			lastUpdated
			updatedBy {
				_id
				name
			}
		}
	}
`;
