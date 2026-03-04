import { gql } from "@apollo/client/core/index.js";

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
            outcomeTitle
            outcomeWinner
            shares
            wagered
            avgPrice
            currentPrice
            estimatedValue
            profitLoss
            netProfitLoss
            profitLossPercentage
            currencyCode
            status
        }
    }
`;

export const USER_MARKET_DETAILS_QUERY = gql`
    query userMarketDetails($marketPredictionSlug: String) {
        userMarketDetails(marketPredictionSlug: $marketPredictionSlug) {
            shareTotalsByOutcome {
                amount
                wagered
                avg_price
                market_outcome_id
                market_id
            }
            isWatching
        }
    }
`;
