import { ClobClient } from "./client.ts";
import { Chain } from "./types.ts";
import { PrevisionsGraphQLClient } from "./graphql/client.ts";

/**
 * Factory para o fluxo interno PREVISIONS com Sanctum (sem expor parâmetros legados no call-site).
 */
export const createPrevisionsSanctumClient = (
  host: string,
  chainId: Chain,
  authToken: string,
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
 * Factory para client GraphQL Apollo PREVISIONS.
 */
export const createPrevisionsGraphQLClient = (
  endpoint: string,
  token: string,
  locale = "pt-BR",
  headers?: Record<string, string>,
): PrevisionsGraphQLClient => {
  return new PrevisionsGraphQLClient({ endpoint, token, locale, headers });
};
