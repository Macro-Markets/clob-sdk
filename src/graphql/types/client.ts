import type { MarketOrderPreview } from "./orders.ts";

export interface GraphQLClientConfig {
    endpoint: string;
    token?: string;
    locale?: string;
    headers?: Record<string, string>;
}

export interface PreviewAndExecuteResult<TOrder = unknown> {
    preview: MarketOrderPreview;
    order: TOrder;
}

export interface PreviewAndExecuteOptions {
    allowInsufficientBalance?: boolean;
    allowInsufficientShares?: boolean;
}
