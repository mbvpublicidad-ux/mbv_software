import { mergeResolvers } from "@graphql-tools/merge";

import userResolvers from "./userResolvers.js";
import brandModelResolvers from "./brandModelResolvers.js";
import carResolvers from "./carResolvers.js";
import daveCarResolvers from "./daveCarResolvers.js";
import expenseResolvers from "./expenseResolvers.js";
import generalExpenseResolvers from "./generalExpenseResolvers.js";
import jcPaymentResolvers from "./jcPaymentResolvers.js";
import clientPaymentResolvers from "./clientPaymentResolvers.js";
import exchangeRateResolvers from "./exchangeRateResolvers.js";
import companyBalanceResolvers from "./companyBalanceResolvers.js";
import carEstimateResolvers from "./carEstimateResolvers.js";

const resolvers = mergeResolvers([
	userResolvers,
	brandModelResolvers,
	carResolvers,
	daveCarResolvers,
	expenseResolvers,
	generalExpenseResolvers,
	jcPaymentResolvers,
	clientPaymentResolvers,
	exchangeRateResolvers,
	companyBalanceResolvers,
	carEstimateResolvers,
]);

export default resolvers;
