import { gql } from "@apollo/client/core";

export const MARKETS_QUERY = gql`
  query getMarketsPredictions(
    $first: Int!
    $page: Int
    $orderBy: [QueryMarketsPredictionsOrderByOrderByClause!]
    $categorySlugIn: [String]
    $keyword: String
    $language: String!
  ) {
    marketsPredictions(
      first: $first
      page: $page
      orderBy: $orderBy
      categorySlugIn: $categorySlugIn
      keyword: $keyword
      language: $language
    ) {
      data {
        id
        title
        slug
        volume
        currency_code
      }
      paginatorInfo {
        total
        currentPage
      }
    }
  }
`;

export const MARKET_QUERY = gql`
  query getMarket($slug: String) {
    marketPrediction(slug: $slug) {
      id
      title
      slug
      currency_code
      markets {
        id
        title
        outcomes {
          id
          title
          buy_price
          sell_price
        }
      }
    }
  }
`;

export const BUY_CLOB_ORDER_MUTATION = gql`
  mutation buyClobOrder($input: ClobOrderInput!) {
    buyClobOrder(input: $input) {
      success
      title
      description
      cost
    }
  }
`;

export const SELL_CLOB_ORDER_MUTATION = gql`
  mutation sellClobOrder($input: ClobOrderInput!) {
    sellClobOrder(input: $input) {
      success
      title
      description
      cost
    }
  }
`;

export const PREVIEW_ORDER_MUTATION = gql`
  mutation previewOrder($input: PreviewOrderInput!) {
    previewOrder(input: $input) {
      estimated_cost
      estimated_shares
      fee_amount
      fee_percentage
      execution_price
      worst_price
      price_impact
      has_liquidity
      insufficient_balance
      insufficient_shares
      errors
    }
  }
`;

export const USER_MARKET_POSITIONS_QUERY = gql`
  query userMarketPositions(
    $categorySlugIn: [String!]
    $orderBy: [QueryUserMarketPositionsOrderByOrderByClause!]
  ) {
    userMarketPositions(categorySlugIn: $categorySlugIn, orderBy: $orderBy) {
      marketPredictionId
      marketPredictionTitle
      marketId
      outcomeId
      shares
      avgPrice
      currentPrice
      netProfitLoss
      currencyCode
      status
    }
  }
`;

export const MARKET_ACTIVITY_QUERY = gql`
  query marketTransactions($filters: MarketFilter) {
    marketTransactions(filter: $filters) {
      results {
        id
        operation
        outcome_title
        amount
        shares_amount
        created_at
      }
      paginate {
        exclusive_start_key
        page_count
      }
    }
  }
`;

export const ORDER_BOOK_BIDS_QUERY = gql`
  query orderBookBids($outcomeId: Int!, $first: Int, $page: Int) {
    orderBookBids(outcomeId: $outcomeId, first: $first, page: $page) {
      data {
        price
        sizes
      }
    }
  }
`;

export const ORDER_BOOK_ASKS_QUERY = gql`
  query orderBookAsks($outcomeId: Int!, $first: Int, $page: Int) {
    orderBookAsks(outcomeId: $outcomeId, first: $first, page: $page) {
      data {
        price
        sizes
      }
    }
  }
`;
