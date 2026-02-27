// Apollo Client
import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    type NormalizedCacheObject,
} from "@apollo/client/core";

// GraphQL operations
import {
    BUY_AMM_ORDER_MUTATION,
    BUY_CLOB_ORDER_MUTATION,
    CANCEL_CLOB_ORDER_MUTATION,
    MARKET_ACTIVITY_QUERY,
    MARKET_CATEGORIES_QUERY,
    MARKET_HISTORY_QUERY,
    MARKET_QUERY,
    MARKETS_QUERY,
    ME_QUERY,
    MY_ORDER_BOOKS_QUERY,
    ORDER_BOOK_ASKS_QUERY,
    ORDER_BOOK_BIDS_QUERY,
    ORDER_BOOK_QUERY,
    PAGINATED_TRADES_QUERY,
    PREVIEW_ORDER_MUTATION,
    SELL_AMM_ORDER_MUTATION,
    SELL_CLOB_ORDER_MUTATION,
    USER_MARKET_DETAILS_QUERY,
    USER_MARKET_POSITIONS_QUERY,
} from "./operations/index.ts";

// GraphQL types
import type {
    AmmOrderInput,
    CancelClobOrderInput,
    ClobOrderInput,
    GraphQLClientConfig,
    MarketCategoriesInput,
    MarketFilter,
    MarketHistoryInput,
    MarketListInput,
    MeUser,
    MyOrderBooksInput,
    OrderBook,
    PreviewAndExecuteOptions,
    PreviewAndExecuteResult,
    PreviewOrderInput,
    UserMarketDetails,
    UserMarketPosition,
} from "./types/index.ts";

export class GraphQLSdkClient {
    public readonly apollo: ApolloClient<NormalizedCacheObject>;

    constructor(config: GraphQLClientConfig, apolloClient?: ApolloClient<NormalizedCacheObject>) {
        this.apollo =
            apolloClient ??
            new ApolloClient({
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

    public async me(): Promise<MeUser> {
        const { data } = await this.apollo.query({ query: ME_QUERY });
        return data.me;
    }

    public async markets(input: MarketListInput) {
        const { data } = await this.apollo.query({ query: MARKETS_QUERY, variables: input });
        return data.marketsPredictions;
    }

    public async marketBySlug(slug: string) {
        const { data } = await this.apollo.query({ query: MARKET_QUERY, variables: { slug } });
        return data.marketPrediction;
    }

    public async categories(input: MarketCategoriesInput = {}) {
        const { data } = await this.apollo.query({
            query: MARKET_CATEGORIES_QUERY,
            variables: input,
        });
        return data.marketPredictionCategories;
    }

    public async marketHistory(input: MarketHistoryInput) {
        const { data } = await this.apollo.query({ query: MARKET_HISTORY_QUERY, variables: input });
        return data.marketHistory;
    }

    public async myOrderBooks(input: MyOrderBooksInput = {}) {
        const { data } = await this.apollo.query({
            query: MY_ORDER_BOOKS_QUERY,
            variables: input,
        });
        return data.myOrderBooks;
    }

    public async positions(categorySlugIn?: string[]): Promise<UserMarketPosition[]> {
        const { data } = await this.apollo.query({
            query: USER_MARKET_POSITIONS_QUERY,
            variables: { categorySlugIn },
        });
        return data.userMarketPositions;
    }

    public async userMarketDetails(marketPredictionSlug: string): Promise<UserMarketDetails> {
        const { data } = await this.apollo.query({
            query: USER_MARKET_DETAILS_QUERY,
            variables: { marketPredictionSlug },
        });
        return data.userMarketDetails;
    }

    public async orderBook(outcomeId: number): Promise<OrderBook> {
        const { data } = await this.apollo.query({
            query: ORDER_BOOK_QUERY,
            variables: { outcomeId },
        });
        return data.orderBook;
    }

    public async bids(outcomeId: number, first = 10, page = 1) {
        const { data } = await this.apollo.query({
            query: ORDER_BOOK_BIDS_QUERY,
            variables: { outcomeId, first, page },
        });
        return data.orderBookBids;
    }

    public async asks(outcomeId: number, first = 10, page = 1) {
        const { data } = await this.apollo.query({
            query: ORDER_BOOK_ASKS_QUERY,
            variables: { outcomeId, first, page },
        });
        return data.orderBookAsks;
    }

    public async activity(filter: MarketFilter = {}) {
        const { data } = await this.apollo.query({
            query: MARKET_ACTIVITY_QUERY,
            variables: { filter },
        });
        return data.marketTransactions;
    }

    public async tradesPaginated(filter: MarketFilter = {}) {
        const { data } = await this.apollo.query({
            query: PAGINATED_TRADES_QUERY,
            variables: { filter },
        });
        return data.marketTransactions;
    }

    public async previewOrder(input: PreviewOrderInput) {
        const { data } = await this.apollo.mutate({
            mutation: PREVIEW_ORDER_MUTATION,
            variables: { input },
        });
        return data?.previewOrder;
    }

    public async buy(input: ClobOrderInput) {
        const { data } = await this.apollo.mutate({
            mutation: BUY_CLOB_ORDER_MUTATION,
            variables: { input },
        });
        return data?.buyClobOrder;
    }

    public async sell(input: ClobOrderInput) {
        const { data } = await this.apollo.mutate({
            mutation: SELL_CLOB_ORDER_MUTATION,
            variables: { input },
        });
        return data?.sellClobOrder;
    }

    public async cancelOrder(input: CancelClobOrderInput) {
        const { data } = await this.apollo.mutate({
            mutation: CANCEL_CLOB_ORDER_MUTATION,
            variables: { input },
        });
        return data?.cancelClobOrder;
    }

    public async buyAmm(input: AmmOrderInput) {
        const { data } = await this.apollo.mutate({
            mutation: BUY_AMM_ORDER_MUTATION,
            variables: { input },
        });
        return data?.buyAmmOrder;
    }

    public async sellAmm(input: AmmOrderInput) {
        const { data } = await this.apollo.mutate({
            mutation: SELL_AMM_ORDER_MUTATION,
            variables: { input },
        });
        return data?.sellAmmOrder;
    }

    public async previewAndBuy(
        input: ClobOrderInput,
        options: PreviewAndExecuteOptions = {},
    ): Promise<PreviewAndExecuteResult> {
        const preview = await this.previewOrder({
            operation: "BUY",
            amount: input.amount,
            outcome_id: input.outcome_id,
            limit_price: input.limit_price,
        });
        this.ensurePreviewCanExecute(preview, options, "BUY");
        const order = await this.buy(input);
        return { preview, order };
    }

    public async previewAndSell(
        input: ClobOrderInput,
        options: PreviewAndExecuteOptions = {},
    ): Promise<PreviewAndExecuteResult> {
        const preview = await this.previewOrder({
            operation: "SELL",
            amount: input.amount,
            outcome_id: input.outcome_id,
            limit_price: input.limit_price,
        });
        this.ensurePreviewCanExecute(preview, options, "SELL");
        const order = await this.sell(input);
        return { preview, order };
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
