import gql from "graphql-tag";

const carDefs = gql`
	type Car {
		_id: ID!
		brand: Brand!
		carModel: CarModel!
		vin: String!
		dua: String
		year: Int!
		purchaseDate: String!
		saleDate: String
		duaRegistrationDate: String
		publishedPriceCRC: Float!
		finalSalePriceCRC: Float
		purchaseValueUSD: Float!
		invoiceValueUSD: Float!
		owner: String!
		assignedClient: User
		logisticStatus: String!
		availability: String!
		actualMileage: Float!
		adjustedMileage: Float
		images: [String]
		fuelType: String!
		engine: String!
		transmission: String!
		drivetrain: String!
		color: String!
		description: String
		bodyType: String!
		departureFloridaDate: String
		warehouseArrivalDate: String
		dekraPendingDate: String
		availableForSaleDate: String
		repairDate: String
		buyerName: String
		expenses: [Expense]
		creationDate: String!
		updateDate: String!
		profitCRC: Float
	}

	type CarPaginatedResponse {
		cars: [Car!]!
		totalCount: Int!
		totalPages: Int!
		currentPage: Int!
	}

	input CarInput {
		brand: ID!
		carModel: ID!
		vin: String!
		dua: String
		year: Int!
		purchaseDate: String!
		duaRegistrationDate: String
		publishedPriceCRC: Float!
		purchaseValueUSD: Float!
		invoiceValueUSD: Float!
		owner: String
		assignedClient: ID
		logisticStatus: String
		availability: String
		actualMileage: Float!
		adjustedMileage: Float
		images: [String]
		fuelType: String!
		engine: String!
		transmission: String!
		drivetrain: String!
		color: String!
		description: String
		bodyType: String!
		buyerName: String
	}

	input UpdateCarInput {
		brand: ID
		carModel: ID
		vin: String
		dua: String
		year: Int
		purchaseDate: String
		saleDate: String
		duaRegistrationDate: String
		publishedPriceCRC: Float
		finalSalePriceCRC: Float
		purchaseValueUSD: Float
		invoiceValueUSD: Float
		owner: String
		assignedClient: ID
		logisticStatus: String
		availability: String
		actualMileage: Float
		adjustedMileage: Float
		images: [String]
		fuelType: String
		engine: String
		transmission: String
		drivetrain: String
		color: String
		description: String
		bodyType: String
		departureFloridaDate: String
		warehouseArrivalDate: String
		dekraPendingDate: String
		availableForSaleDate: String
		repairDate: String
		buyerName: String
	}

	input CarFilters {
		brand: ID
		carModel: ID
		year: Int
		minYear: Int
		maxYear: Int
		bodyType: String
		transmission: String
		drivetrain: String
		fuelType: String
		color: String
		minPrice: Float
		maxPrice: Float
		logisticStatus: String
		availability: String
		owner: String
		search: String
	}

	input BulkUpdateCarsInput {
		carIds: [ID!]!
		logisticStatus: String
		availability: String
		duaRegistrationDate: String
	}

	type Query {
		cars(
			page: Int
			limit: Int
			filters: CarFilters
			sortBy: String
			sortOrder: String
		): CarPaginatedResponse!
		car(id: ID!): Car
		publicCars(
			page: Int
			limit: Int
			filters: CarFilters
			sortBy: String
			sortOrder: String
		): CarPaginatedResponse!
		myCars: [Car!]!
	}

	type Mutation {
		createCar(input: CarInput!, expenseInputs: [ExpenseInput]): Car!
		updateCar(id: ID!, input: UpdateCarInput!): Car!
		deleteCar(id: ID!): Boolean!
		bulkUpdateCars(input: BulkUpdateCarsInput!): Boolean!
		markCarAsSold(
			id: ID!
			finalSalePriceCRC: Float!
			saleDate: String!
			buyerName: String
		): Car!
		uploadCarImages(id: ID!, images: [String!]!): Car!
		deleteCarImage(id: ID!, imageUrl: String!): Car!
	}
`;

export default carDefs;
