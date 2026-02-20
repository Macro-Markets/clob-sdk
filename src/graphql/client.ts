import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  type NormalizedCacheObject,
} from "@apollo/client/core";
import {
  BUY_CLOB_ORDER_MUTATION,
  MARKET_ACTIVITY_QUERY,
  MARKET_QUERY,
  MARKETS_QUERY,
  ORDER_BOOK_ASKS_QUERY,
  ORDER_BOOK_BIDS_QUERY,
  PREVIEW_ORDER_MUTATION,
  SELL_CLOB_ORDER_MUTATION,
  USER_MARKET_POSITIONS_QUERY,
} from "./operations.ts";
import type {
  GraphQLClientConfig,
  MarketListInput,
  OrderInput,
  PreviewOrderInput,
} from "./types.ts";

export class PrevisionsGraphQLClient {
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

  public async positions(categorySlugIn?: string[]) {
    const { data } = await this.apollo.query({ query: USER_MARKET_POSITIONS_QUERY, variables: { categorySlugIn } });
    return data.userMarketPositions;
  }

  public async activity(filters: Record<string, unknown>) {
    const { data } = await this.apollo.query({ query: MARKET_ACTIVITY_QUERY, variables: { filters } });
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
}
