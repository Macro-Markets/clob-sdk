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
