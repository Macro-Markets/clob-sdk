import { ClobClient } from "./client.ts";
import { GraphQLSdkClient } from "./graphql/client.ts";

/**
 * Factory for Sanctum-token usage with sensible defaults.
 */
export const createSanctumClient = (
  host: string,
  authToken: string,
): ClobClient => {
  return new ClobClient({
    host,
    authToken,
  });
};

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
