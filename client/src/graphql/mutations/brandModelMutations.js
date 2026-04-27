import gql from "graphql-tag";

export const CREATE_BRAND = gql`
	mutation CreateBrand($input: BrandInput!) {
		createBrand(input: $input) {
			_id
			name
		}
	}
`;

export const UPDATE_BRAND = gql`
	mutation UpdateBrand($id: ID!, $input: BrandInput!) {
		updateBrand(id: $id, input: $input) {
			_id
			name
		}
	}
`;

export const DELETE_BRAND = gql`
	mutation DeleteBrand($id: ID!) {
		deleteBrand(id: $id)
	}
`;

export const CREATE_CAR_MODEL = gql`
	mutation CreateCarModel($input: ModelInput!) {
		createCarModel(input: $input) {
			_id
			name
			brand {
				_id
				name
			}
		}
	}
`;

export const UPDATE_CAR_MODEL = gql`
	mutation UpdateCarModel($id: ID!, $input: ModelInput!) {
		updateCarModel(id: $id, input: $input) {
			_id
			name
			brand {
				_id
				name
			}
		}
	}
`;

export const DELETE_CAR_MODEL = gql`
	mutation DeleteCarModel($id: ID!) {
		deleteCarModel(id: $id)
	}
`;
