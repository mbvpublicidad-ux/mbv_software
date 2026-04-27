import gql from "graphql-tag";

const daveCarDefs = gql`
	type DaveCar {
		_id: ID!
		vin: String!
		dua: String!
		brand: String!
		model: String!
		year: Int!
		color: String!
		duaRegistrationDate: String
		owner: String!
		availability: String!
		creationDate: String!
	}

	type DaveCarPaginatedResponse {
		cars: [DaveCar!]!
		totalCount: Int!
		totalPages: Int!
		currentPage: Int!
	}

	input DaveCarInput {
		vin: String!
		dua: String!
		brand: String!
		model: String!
		year: Int!
		color: String!
		duaRegistrationDate: String
		availability: String
	}

	input UpdateDaveCarInput {
		vin: String
		dua: String
		brand: String
		model: String
		year: Int
		color: String
		duaRegistrationDate: String
		availability: String
	}

	type Query {
		daveCars(
			page: Int
			limit: Int
			search: String
			availability: String
		): DaveCarPaginatedResponse!
		daveCar(id: ID!): DaveCar
	}

	type Mutation {
		createDaveCar(input: DaveCarInput!): DaveCar!
		updateDaveCar(id: ID!, input: UpdateDaveCarInput!): DaveCar!
		deleteDaveCar(id: ID!): Boolean!
	}
`;

export default daveCarDefs;
