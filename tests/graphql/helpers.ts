import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { MockLink } from "@apollo/client/testing/core";
import { GraphQLSdkClient } from "../../src/graphql/client.ts";

export const buildClient = (mocks: any[]): GraphQLSdkClient => {
    const apollo = new ApolloClient({
        cache: new InMemoryCache(),
        link: new MockLink(mocks),
        defaultOptions: { query: { fetchPolicy: "no-cache" } },
    });
    return new GraphQLSdkClient({ endpoint: "https://api.example.com/graphql" }, apollo);
};
