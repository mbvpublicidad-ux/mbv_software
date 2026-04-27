import gql from "graphql-tag";

export const GET_DAVE_CARS = gql`
	query DaveCars(
		$page: Int
		$limit: Int
		$search: String
		$availability: String
	) {
		daveCars(
			page: $page
			limit: $limit
			search: $search
			availability: $availability
		) {
			cars {
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
			totalCount
			totalPages
			currentPage
		}
	}
`;
