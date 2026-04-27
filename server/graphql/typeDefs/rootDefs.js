import gql from "graphql-tag";

import { mergeTypeDefs } from "@graphql-tools/merge";

import userDefs from "./userDefs.js";
import brandModelDefs from "./brandModelDefs.js";
import carDefs from "./carDefs.js";
import daveCarDefs from "./daveCarDefs.js";
import expenseDefs from "./expenseDefs.js";
import generalExpenseDefs from "./generalExpenseDefs.js";
import jcPaymentDefs from "./jcPaymentDefs.js";
import clientPaymentDefs from "./clientPaymentDefs.js";
import exchangeRateDefs from "./exchangeRateDefs.js";
import companyBalanceDefs from "./companyBalanceDefs.js";

const customScalars = gql`
	scalar Upload
`;

const typeDefs = mergeTypeDefs([
	customScalars,
	userDefs,
	brandModelDefs,
	carDefs,
	daveCarDefs,
	expenseDefs,
	generalExpenseDefs,
	jcPaymentDefs,
	clientPaymentDefs,
	exchangeRateDefs,
	companyBalanceDefs,
]);

export default typeDefs;
