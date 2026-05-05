import gql from "graphql-tag";

export const UPDATE_INITIAL_AMOUNT_CRC = gql`
	mutation UpdateInitialAmountCRC($amount: Float!) {
		updateInitialAmountCRC(amount: $amount) {
			_id
			initialAmountCRC
			initialAmountUSD
			currentBalanceCRC
			currentBalanceUSD
			lastUpdated
		}
	}
`;

export const UPDATE_INITIAL_AMOUNT_USD = gql`
	mutation UpdateInitialAmountUSD($amount: Float!) {
		updateInitialAmountUSD(amount: $amount) {
			_id
			initialAmountCRC
			initialAmountUSD
			currentBalanceCRC
			currentBalanceUSD
			lastUpdated
		}
	}
`;

export const RECALCULATE_BALANCE = gql`
	mutation RecalculateBalance {
		recalculateBalance {
			_id
			initialAmountCRC
			initialAmountUSD
			currentBalanceCRC
			currentBalanceUSD
			lastUpdated
		}
	}
`;
