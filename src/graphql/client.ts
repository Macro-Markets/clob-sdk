import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  type NormalizedCacheObject,
} from "@apollo/client/core";
import {
  BUY_CLOB_ORDER_MUTATION,
  MARKET_ACTIVITY_QUERY,
  MARKET_CATEGORIES_QUERY,
  MARKET_HISTORY_QUERY,
  MARKET_QUERY,
  MARKETS_QUERY,
  MY_ORDERS_QUERY,
  ORDER_BOOK_ASKS_QUERY,
  ORDER_BOOK_BIDS_QUERY,
  PAGINATED_TRADES_QUERY,
  PREVIEW_ORDER_MUTATION,
  SELL_CLOB_ORDER_MUTATION,
  USER_MARKET_POSITIONS_QUERY,
} from "./operations.ts";
import type {
  GraphQLClientConfig,
  MarketCategoriesInput,
  MarketHistoryInput,
  MarketListInput,
  MyOrdersInput,
  OrderInput,
  PreviewAndExecuteOptions,
  PreviewAndExecuteResult,
  PreviewOrderInput,
} from "./types.ts";

export class GraphQLSdkClient {
  public readonly apollo: ApolloClient<NormalizedCacheObject>;

  constructor(config: GraphQLClientConfig, apolloClient?: ApolloClient<NormalizedCacheObject>) {
    this.apollo = apolloClient ?? new ApolloClient({
      link: new HttpLink({
        uri: config.endpoint,
        headers: {
          ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
          ...(config.locale ? { "Accept-Language": config.locale } : {}),
          ...(config.headers ?? {}),
        },
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: "no-cache" },
        query: { fetchPolicy: "no-cache" },
      },
    });
  }

  public async markets(input: MarketListInput) {
    const { data } = await this.apollo.query({ query: MARKETS_QUERY, variables: input });
    return data.marketsPredictions;
  }

  public async marketBySlug(slug: string) {
    const { data } = await this.apollo.query({ query: MARKET_QUERY, variables: { slug } });
    return data.marketPrediction;
  }

  public async categories(input: MarketCategoriesInput) {
    const { data } = await this.apollo.query({ query: MARKET_CATEGORIES_QUERY, variables: input });
    return data.marketCategories;
  }

  public async marketHistory(input: MarketHistoryInput) {
    const { data } = await this.apollo.query({ query: MARKET_HISTORY_QUERY, variables: input });
    return data.marketHistory;
  }

  public async myOrders(input: MyOrdersInput) {
    const { data } = await this.apollo.query({ query: MY_ORDERS_QUERY, variables: input });
    return data.myOrders;
  }

  public async previewOrder(input: PreviewOrderInput) {
    const { data } = await this.apollo.mutate({ mutation: PREVIEW_ORDER_MUTATION, variables: { input } });
    return data?.previewOrder;
  }

  public async buy(input: OrderInput & { limit_price?: number }) {
    const { data } = await this.apollo.mutate({ mutation: BUY_CLOB_ORDER_MUTATION, variables: { input } });
    return data?.buyClobOrder;
  }

  public async sell(input: OrderInput & { limit_price?: number }) {
    const { data } = await this.apollo.mutate({ mutation: SELL_CLOB_ORDER_MUTATION, variables: { input } });
    return data?.sellClobOrder;
  }

  public async previewAndBuy(
    input: PreviewOrderInput & { limit_price?: number },
    options: PreviewAndExecuteOptions = {},
  ): Promise<PreviewAndExecuteResult> {
    const preview = await this.previewOrder({
      operation: "BUY",
      amount: input.amount,
      outcome_id: input.outcome_id,
      slippage: input.slippage,
      target_price: input.target_price,
    });
    this.ensurePreviewCanExecute(preview, options, "BUY");

    const order = await this.buy({
      amount: input.amount,
      outcome_id: input.outcome_id,
      slippage: input.slippage,
      target_price: input.target_price,
      limit_price: input.limit_price,
    });

    return { preview, order };
  }

  public async previewAndSell(
    input: PreviewOrderInput & { limit_price?: number },
    options: PreviewAndExecuteOptions = {},
  ): Promise<PreviewAndExecuteResult> {
    const preview = await this.previewOrder({
      operation: "SELL",
      amount: input.amount,
      outcome_id: input.outcome_id,
      slippage: input.slippage,
      target_price: input.target_price,
    });
    this.ensurePreviewCanExecute(preview, options, "SELL");

    const order = await this.sell({
      amount: input.amount,
      outcome_id: input.outcome_id,
      slippage: input.slippage,
      target_price: input.target_price,
      limit_price: input.limit_price,
    });

    return { preview, order };
  }

  public async positions(categorySlugIn?: string[]) {
    const { data } = await this.apollo.query({ query: USER_MARKET_POSITIONS_QUERY, variables: { categorySlugIn } });
    return data.userMarketPositions;
  }

  public async activity(filters: Record<string, unknown>) {
    const { data } = await this.apollo.query({ query: MARKET_ACTIVITY_QUERY, variables: { filters } });
    return data.marketTransactions;
  }

  public async tradesPaginated(filters: Record<string, unknown>) {
    const { data } = await this.apollo.query({ query: PAGINATED_TRADES_QUERY, variables: { filters } });
    return data.marketTransactions;
  }

  public async bids(outcomeId: number, first = 10, page = 1) {
    const { data } = await this.apollo.query({ query: ORDER_BOOK_BIDS_QUERY, variables: { outcomeId, first, page } });
    return data.orderBookBids;
  }

  public async asks(outcomeId: number, first = 10, page = 1) {
    const { data } = await this.apollo.query({ query: ORDER_BOOK_ASKS_QUERY, variables: { outcomeId, first, page } });
    return data.orderBookAsks;
  }

  private ensurePreviewCanExecute(
    preview: any,
    options: PreviewAndExecuteOptions,
    operation: "BUY" | "SELL",
  ): void {
    if (!preview) {
      throw new Error(`Preview ${operation} failed: empty response`);
    }

    if (!preview.has_liquidity) {
      throw new Error(`Preview ${operation} failed: no liquidity`);
    }

    if (preview.insufficient_balance && !options.allowInsufficientBalance) {
      throw new Error(`Preview ${operation} failed: insufficient balance`);
    }

    if (preview.insufficient_shares && !options.allowInsufficientShares) {
      throw new Error(`Preview ${operation} failed: insufficient shares`);
    }

    if (Array.isArray(preview.errors) && preview.errors.length > 0) {
      throw new Error(`Preview ${operation} failed: ${preview.errors.join(", ")}`);
    }
  }
}
