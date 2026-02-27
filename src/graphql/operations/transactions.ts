import { gql } from "@apollo/client/core";

export const MARKET_ACTIVITY_QUERY = gql`
    query marketActivity($filter: MarketFilter) {
        marketTransactions(filter: $filter) {
            results {
                id
                operation
                outcome_title
                amount
                shares_amount
                created_at
                transaction_type
                currency_code
            }
            paginate {
                exclusive_start_key
                page_count
            }
        }
    }
`;

export const PAGINATED_TRADES_QUERY = gql`
    query paginatedTrades($filter: MarketFilter) {
        marketTransactions(filter: $filter) {
            results {
                id
                operation
                outcome_title
                amount
                shares_amount
                created_at
                transaction_type
                currency_code
            }
            paginate {
                exclusive_start_key
                page_count
            }
        }
    }
`;
