import { ClobClient } from "./client.ts";
import { Chain } from "./types.ts";
import { GraphQLSdkClient } from "./graphql/client.ts";

/**
 * Factory for Sanctum-token usage with sensible defaults.
 */
export const createSanctumClient = (
  host: string,
  authToken: string,
  chainId: Chain = Chain.POLYGON,
): ClobClient => {
  return new ClobClient(
    host,
    chainId,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    authToken,
  );
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
