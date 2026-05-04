import gql from "graphql-tag";

export const GET_JC_PAYMENTS = gql`
	query JCPayments($startDate: String, $endDate: String, $carId: ID) {
		jcPayments(startDate: $startDate, endDate: $endDate, carId: $carId) {
			_id
			amount
			actualPaymentDate
			registrationDate
			concept
			associatedCars {
				car {
					_id
					brand {
						name
					}
					carModel {
						name
					}
					year
					vin
				}
				amount
			}
			receipt
			transferReference
			createdBy {
				_id
				name
			}
			updatedBy {
				_id
				name
			}
			updatable
		}
	}
`;

export const GET_JC_DEBT_SUMMARY = gql`
	query JCDebtSummary {
		jcDebtSummary {
			totalInvestedUSD
			totalPaidUSD
			totalPendingUSD
			payments {
				_id
				amount
				actualPaymentDate
				concept
				associatedCars {
					car {
						_id
						brand {
							name
						}
						carModel {
							name
						}
						year
						vin
					}
					amount
				}
			}
		}
	}
`;
