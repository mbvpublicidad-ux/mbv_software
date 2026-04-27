import DaveCar from "../../models/DaveCar.js";

const daveCarResolvers = {
	Query: {
		daveCars: async (_, { page = 1, limit = 12, search, availability }) => {
			const query = {};

			if (availability) query.availability = availability;
			if (search) {
				query.$or = [
					{ vin: { $regex: search, $options: "i" } },
					{ dua: { $regex: search, $options: "i" } },
					{ brand: { $regex: search, $options: "i" } },
					{ model: { $regex: search, $options: "i" } },
				];
			}

			const totalCount = await DaveCar.countDocuments(query);
			const totalPages = Math.ceil(totalCount / limit);

			const cars = await DaveCar.find(query)
				.sort({ creationDate: -1 })
				.skip((page - 1) * limit)
				.limit(limit);

			return {
				cars,
				totalCount,
				totalPages,
				currentPage: page,
			};
		},

		daveCar: async (_, { id }) => {
			return DaveCar.findById(id);
		},
	},

	Mutation: {
		createDaveCar: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			return DaveCar.create(input);
		},

		updateDaveCar: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await DaveCar.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			);

			if (!car) throw new Error("Dave car not found");
			return car;
		},

		deleteDaveCar: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			await DaveCar.findByIdAndDelete(id);
			return true;
		},
	},
};

export default daveCarResolvers;
