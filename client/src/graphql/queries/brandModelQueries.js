import gql from "graphql-tag";

export const GET_BRANDS = gql`
	query Brands {
		brands {
			_id
			name
			createdBy {
				_id
				name
			}
			createdAt
			updatedAt
		}
	}
`;

export const GET_BRAND = gql`
	query Brand($id: ID!) {
		brand(id: $id) {
			_id
			name
		}
	}
`;

export const GET_CAR_MODELS = gql`
	query CarModels($brandId: ID) {
		carModels(brandId: $brandId) {
			_id
			name
			brand {
				_id
				name
			}
		}
	}
`;

export const GET_CAR_MODEL = gql`
	query CarModel($id: ID!) {
		carModel(id: $id) {
			_id
			name
			brand {
				_id
				name
			}
		}
	}
`;
