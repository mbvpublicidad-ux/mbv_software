import gql from "graphql-tag";

import { CAR_FRAGMENT } from "../queries/carQueries";

export const CREATE_CAR = gql`
	mutation CreateCar($input: CarInput!, $expenseInputs: [ExpenseInput]) {
		createCar(input: $input, expenseInputs: $expenseInputs) {
			...CarFields
		}
	}
	${CAR_FRAGMENT}
`;

export const UPDATE_CAR = gql`
	mutation UpdateCar($id: ID!, $input: UpdateCarInput!) {
		updateCar(id: $id, input: $input) {
			...CarFields
		}
	}
	${CAR_FRAGMENT}
`;

export const DELETE_CAR = gql`
	mutation DeleteCar($id: ID!) {
		deleteCar(id: $id)
	}
`;

export const BULK_UPDATE_CARS = gql`
	mutation BulkUpdateCars($input: BulkUpdateCarsInput!) {
		bulkUpdateCars(input: $input)
	}
`;

export const MARK_CAR_AS_SOLD = gql`
	mutation MarkCarAsSold(
		$id: ID!
		$finalSalePriceCRC: Float!
		$saleDate: String!
		$buyerName: String
	) {
		markCarAsSold(
			id: $id
			finalSalePriceCRC: $finalSalePriceCRC
			saleDate: $saleDate
			buyerName: $buyerName
		) {
			...CarFields
		}
	}
	${CAR_FRAGMENT}
`;

export const UPLOAD_CAR_IMAGES = gql`
	mutation UploadCarImages($id: ID!, $images: [String!]!) {
		uploadCarImages(id: $id, images: $images) {
			_id
			images
		}
	}
`;

export const DELETE_CAR_IMAGE = gql`
	mutation DeleteCarImage($id: ID!, $imageUrl: String!) {
		deleteCarImage(id: $id, imageUrl: $imageUrl) {
			_id
			images
		}
	}
`;
