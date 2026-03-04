import { gql } from "@apollo/client/core/index.js";

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
                    clob_buy_price
                    clob_sell_price
                    chance_to_win
                }
            }
        }
    }
`;

export const MARKET_CATEGORIES_QUERY = gql`
    query marketPredictionCategories($language: String, $enabled: Boolean) {
        marketPredictionCategories(first: 100, language: $language, enabled: $enabled) {
            data {
                id
                name
                slug
                total_markets
            }
        }
    }
`;

export const MARKET_HISTORY_QUERY = gql`
    query marketHistory($slug: String, $period: String) {
        marketHistory(slug: $slug, period: $period) {
            outcome_id
            outcome_title
            market_id
            market_title
            history {
                t
                p
            }
        }
    }
`;
