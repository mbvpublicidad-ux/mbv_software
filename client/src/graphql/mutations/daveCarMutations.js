import gql from "graphql-tag";

export const CREATE_DAVE_CAR = gql`
	mutation CreateDaveCar($input: DaveCarInput!) {
		createDaveCar(input: $input) {
			_id
			vin
			dua
			brand
			model
			year
			color
			duaRegistrationDate
			owner
			availability
			creationDate
		}
	}
`;

export const UPDATE_DAVE_CAR = gql`
	mutation UpdateDaveCar($id: ID!, $input: UpdateDaveCarInput!) {
		updateDaveCar(id: $id, input: $input) {
			_id
			vin
			dua
			brand
			model
			year
			color
			duaRegistrationDate
			availability
		}
	}
`;

export const DELETE_DAVE_CAR = gql`
	mutation DeleteDaveCar($id: ID!) {
		deleteDaveCar(id: $id)
	}
`;
