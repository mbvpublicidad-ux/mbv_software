import gql from "graphql-tag"

export const CAR_FRAGMENT = gql`
	fragment CarFields on Car {
		_id
		brand {
			_id
			name
		}
		carModel {
			_id
			name
		}
		vin
		dua
		year
		purchaseDate
		saleDate
		duaRegistrationDate
		publishedPriceCRC
		finalSalePriceCRC
		purchaseValueUSD
		invoiceValueUSD
		owner
		assignedClient {
			_id
			name
			email
		}
		logisticStatus
		availability
		actualMileage
		adjustedMileage
		images
		fuelType
		engine
		transmission
		drivetrain
		color
		description
		bodyType
		departureFloridaDate
		warehouseArrivalDate
		dekraPendingDate
		availableForSaleDate
		repairDate
		buyerName
		creationDate
		updateDate
		profitCRC
		expenses {
			_id
			type
			amount
			currency
			expenseDate
			isFromJuanCarlos
		}
	}
`;

export const PUBLIC_CAR_FRAGMENT = gql`
	fragment PublicCarFields on Car {
		_id
		brand {
			_id
			name
		}
		carModel {
			_id
			name
		}
		year
		publishedPriceCRC
		logisticStatus
		actualMileage
		adjustedMileage
		images
		fuelType
		engine
		transmission
		drivetrain
		color
		description
		bodyType
	}
`;

export const GET_CARS = gql`
	query Cars(
		$page: Int
		$limit: Int
		$filters: CarFilters
		$sortBy: String
		$sortOrder: String
	) {
		cars(
			page: $page
			limit: $limit
			filters: $filters
			sortBy: $sortBy
			sortOrder: $sortOrder
		) {
			cars {
				...CarFields
			}
			totalCount
			totalPages
			currentPage
		}
	}
	${CAR_FRAGMENT}
`;

export const GET_CAR = gql`
	query Car($id: ID!) {
		car(id: $id) {
			...CarFields
		}
	}
	${CAR_FRAGMENT}
`;

export const GET_PUBLIC_CARS = gql`
	query PublicCars(
		$page: Int
		$limit: Int
		$filters: CarFilters
		$sortBy: String
		$sortOrder: String
	) {
		publicCars(
			page: $page
			limit: $limit
			filters: $filters
			sortBy: $sortBy
			sortOrder: $sortOrder
		) {
			cars {
				...PublicCarFields
			}
			totalCount
			totalPages
			currentPage
		}
	}
	${PUBLIC_CAR_FRAGMENT}
`;

export const GET_MY_CARS = gql`
	query MyCars {
		myCars {
			...CarFields
		}
	}
	${CAR_FRAGMENT}
`;
