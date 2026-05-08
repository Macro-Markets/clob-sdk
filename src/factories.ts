import { GraphQLSdkClient } from "./graphql/client.ts";

/**
 * Factory for GraphQL Apollo SDK client.
 */
export const createGraphQLClient = (
    endpoint: string,
    token: string,
    locale = "en",
    headers?: Record<string, string>,
): GraphQLSdkClient => {
    return new GraphQLSdkClient({ endpoint, token, locale, headers });
};
