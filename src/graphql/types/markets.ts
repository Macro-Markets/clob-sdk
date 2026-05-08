export interface MarketListInput {
    first: number;
    page?: number;
    categorySlugIn?: string[];
    keyword?: string;
    language: string;
}

export interface MarketCategoriesInput {
    language?: string;
    enabled?: boolean;
}

export interface MarketHistoryInput {
    slug: string;
    period?: string;
}

export interface MarketFilter {
    market_prediction_id?: number;
    market_id?: number;
    outcome_id?: number;
    exclusive_start_key?: string;
    /** Number of results (backend field name is `limit`). */
    limit?: number;
}
