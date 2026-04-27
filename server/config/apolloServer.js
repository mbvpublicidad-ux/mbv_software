import { ApolloServer } from "@apollo/server";

import typeDefs from "../graphql/typeDefs/rootDefs.js";
import resolvers from "../graphql/resolvers/rootResolvers.js";

const createApolloServer = async () => {
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		introspection: true,
	});

	await server.start();
	return server;
};

export default createApolloServer;
