import { gql } from "@apollo/client/core";

export const ME_QUERY = gql`
    query me {
        me {
            id
            username
            display_name
            email
            created_at
        }
    }
`;
