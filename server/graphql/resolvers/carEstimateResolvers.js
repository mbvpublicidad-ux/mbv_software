import CarEstimate from "../../models/CarEstimate.js";

const carEstimateResolvers = {
	Query: {
		carEstimates: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return CarEstimate.find().populate("car");
		},
	},
	Mutation: {
		saveCarEstimate: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}
			return CarEstimate.findOneAndUpdate(
				{ car: input.car },
				{ ...input, updatedBy: user._id, updatedAt: new Date() },
				{ upsert: true, new: true },
			).populate("car");
		},
	},
};

export default carEstimateResolvers;
