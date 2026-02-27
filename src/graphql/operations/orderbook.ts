import { gql } from "@apollo/client/core";

export const ORDER_BOOK_QUERY = gql`
    query orderBook($outcomeId: Int!) {
        orderBook(outcomeId: $outcomeId) {
            asks {
                price
                sizes
            }
            bids {
                price
                sizes
            }
            last_trade_price
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
