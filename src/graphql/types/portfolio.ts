export interface MyOrderBooksInput {
    marketPredictionId?: number;
    status?: string[];
    first?: number;
    page?: number;
}

export interface ShareTotalsByOutcome {
    amount: number;
    wagered: number;
    avg_price: number;
    market_outcome_id: number;
    market_id: number;
}

export interface UserMarketDetails {
    shareTotalsByOutcome: ShareTotalsByOutcome[];
    isWatching: boolean;
}

export interface UserMarketPosition {
    marketPredictionId: number;
    marketPredictionTitle: string;
    marketId: number;
    outcomeId: number;
    outcomeTitle: string;
    outcomeWinner: boolean;
    shares: number;
    wagered: number;
    avgPrice: number;
    currentPrice: number;
    estimatedValue: number;
    profitLoss: number;
    netProfitLoss: number;
    profitLossPercentage: number;
    currencyCode: string;
    status: string;
}
