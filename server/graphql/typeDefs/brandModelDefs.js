import gql from "graphql-tag";

const brandModelDefs = gql`
	type Brand {
		_id: ID!
		name: String!
		createdBy: User
		createdAt: String!
		updatedAt: String!
	}

	type CarModel {
		_id: ID!
		name: String!
		brand: Brand!
		createdBy: User
		createdAt: String!
		updatedAt: String!
	}

	input BrandInput {
		name: String!
	}

	input ModelInput {
		name: String!
		brand: ID!
	}

	type Query {
		brands: [Brand!]!
		brand(id: ID!): Brand
		carModels(brandId: ID): [CarModel!]!
		carModel(id: ID!): CarModel
	}

	type Mutation {
		createBrand(input: BrandInput!): Brand!
		updateBrand(id: ID!, input: BrandInput!): Brand!
		deleteBrand(id: ID!): Boolean!
		createCarModel(input: ModelInput!): CarModel!
		updateCarModel(id: ID!, input: ModelInput!): CarModel!
		deleteCarModel(id: ID!): Boolean!
	}
`;

export default brandModelDefs;
