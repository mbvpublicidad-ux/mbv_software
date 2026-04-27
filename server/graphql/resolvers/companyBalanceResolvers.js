import CompanyBalance from "../../models/CompanyBalance.js";

const companyBalanceResolvers = {
	Query: {
		companyBalance: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne().populate("updatedBy");

			if (!balance) {
				// Create initial balance if it doesn't exist
				balance = await CompanyBalance.create({
					initialAmount: 0,
					currentBalance: 0,
				});
			}

			return balance;
		},
	},

	Mutation: {
		updateInitialAmount: async (_, { amount }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			let balance = await CompanyBalance.findOne();

			if (!balance) {
				balance = await CompanyBalance.create({
					initialAmount: amount,
					currentBalance: amount,
					updatedBy: user._id,
				});
			} else {
				// Adjust current balance proportionally
				const difference = amount - balance.initialAmount;
				balance.initialAmount = amount;
				balance.currentBalance += difference;
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return CompanyBalance.findById(balance._id).populate("updatedBy");
		},
	},
};

export default companyBalanceResolvers;
