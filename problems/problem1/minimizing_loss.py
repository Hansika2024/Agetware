def minimize_loss(prices):
    min_loss = float('inf')
    buy_year, sell_year = -1, -1

    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            if prices[j] < prices[i]:  # must sell at loss
                loss = prices[i] - prices[j]
                if loss < min_loss:
                    min_loss = loss
                    buy_year = i + 1
                    sell_year = j + 1

    return (buy_year, sell_year, min_loss)

# Example
prices = [20, 15, 7, 2, 13]
print("Buy Year, Sell Year, Min Loss:", minimize_loss(prices))
