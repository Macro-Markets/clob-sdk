export type MarketOrderOperation = "BUY" | "SELL";

export interface GraphQLClientConfig {
  endpoint: string;
  token?: string;
  locale?: string;
  headers?: Record<string, string>;
}

export interface MarketListInput {
  first: number;
  page?: number;
  categorySlugIn?: string[];
  keyword?: string;
  language: string;
}

export interface OrderInput {
  amount: number;
  outcome_id: number;
  slippage?: number;
  target_price?: number;
}

export interface PreviewOrderInput extends OrderInput {
  operation: MarketOrderOperation;
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
