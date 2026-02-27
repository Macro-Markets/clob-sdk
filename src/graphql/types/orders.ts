export type MarketOrderOperation = "BUY" | "SELL";

export interface ClobOrderInput {
    amount: number;
    outcome_id: number;
    limit_price?: number;
}

export interface CancelClobOrderInput {
    order_id: string;
}

export interface AmmOrderInput {
    amount: number;
    outcome_id: number;
    target_price?: number;
    slippage?: number;
}

export interface PreviewOrderInput {
    amount: number;
    outcome_id: number;
    operation: MarketOrderOperation;
    limit_price?: number;
    slippage?: number;
}

export interface MarketOrderPreview {
    estimated_cost: number;
    estimated_shares: number;
    fee_amount: number;
    fee_percentage: number;
    execution_price: number;
    worst_price: number;
    price_impact: number;
    has_liquidity: boolean;
    insufficient_balance: boolean;
    insufficient_shares: boolean;
    errors: string[];
}

export interface OrderResult {
    success: boolean;
    title: string;
    description: string;
    cost?: number;
}

export interface CancelOrderResult {
    success: boolean;
    title: string;
    description: string;
}
