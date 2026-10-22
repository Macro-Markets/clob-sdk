import "dotenv/config";
import { createGraphQLClient } from "../factories.ts";
import type { GraphQLSdkClient } from "../graphql/client.ts";

function getEnvOrFail(key: string): string {
    const val = process.env[key];
    if (!val) {
        throw new Error(`Missing required env var: ${key}. Set it in .env or export it.`);
    }
    return val;
}

export async function getClient(locale = "en"): Promise<GraphQLSdkClient> {
    const endpoint = getEnvOrFail("ENDPOINT");
    const token = getEnvOrFail("API_TOKEN");
    return createGraphQLClient(endpoint, token, locale);
}

/** Public market data does not require a token. Private commands still use getClient. */
export async function getPublicClient(locale = "en"): Promise<GraphQLSdkClient> {
    const endpoint = getEnvOrFail("ENDPOINT");
    return createGraphQLClient(endpoint, process.env["API_TOKEN"] ?? "", locale);
}
