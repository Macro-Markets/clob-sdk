export interface OrderBookEntry {
    price: number;
    sizes: number[];
}

export interface OrderBook {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
    last_trade_price: number;
}
