import { gql } from "@apollo/client/core/index.js";

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

export const CANCEL_CLOB_ORDER_MUTATION = gql`
    mutation cancelClobOrder($input: CancelClobOrderInput!) {
        cancelClobOrder(input: $input) {
            success
            title
            description
        }
    }
`;

export const BUY_AMM_ORDER_MUTATION = gql`
    mutation buyAmmOrder($input: AmmOrderInput!) {
        buyAmmOrder(input: $input) {
            success
            title
            description
            cost
        }
    }
`;

export const SELL_AMM_ORDER_MUTATION = gql`
    mutation sellAmmOrder($input: AmmOrderInput!) {
        sellAmmOrder(input: $input) {
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

export const MY_ORDER_BOOKS_QUERY = gql`
    query myOrderBooks($marketPredictionId: Int, $status: [String!], $first: Int, $page: Int) {
        myOrderBooks(
            marketPredictionId: $marketPredictionId
            status: $status
            first: $first
            page: $page
        ) {
            data {
                id
                status
                side
                type
                price
                original_amount
                remaining_amount
                avg_price
                created_at
                updated_at
                outcome_id
            }
            paginatorInfo {
                total
                currentPage
            }
        }
    }
`;
