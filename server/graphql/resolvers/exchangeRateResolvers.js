import ExchangeRate from "../../models/ExchangeRate.js";

const exchangeRateResolvers = {
	Query: {
		exchangeRate: async () => {
			const rate = await ExchangeRate.findOne()
				.sort({ updateDate: -1 })
				.populate("updatedBy");

			if (!rate) {
				throw new Error(
					"No exchange rate configured. Please set up an exchange rate first.",
				);
			}

			return rate;
		},

		exchangeRates: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			return ExchangeRate.find({})
				.populate("updatedBy")
				.sort({ updateDate: -1 })
				.limit(10);
		},
	},

	Mutation: {
		updateExchangeRate: async (_, { value }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const rate = await ExchangeRate.create({
				value,
				updatedBy: user._id,
			});

			return ExchangeRate.findById(rate._id).populate("updatedBy");
		},
	},
};

export default exchangeRateResolvers;
