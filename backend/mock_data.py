"""
Mock data module for the Investing101 application.
This provides hardcoded data for development and testing.
"""

# Mock stock search results
def get_mock_search_results(keywords):
    """Return mock search results for the given keywords."""
    # Convert keywords to uppercase for case-insensitive matching
    keywords = keywords.upper()

    # Predefined list of stocks
    all_stocks = [
        {
            "1. symbol": "AAPL",
            "2. name": "Apple Inc.",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "MSFT",
            "2. name": "Microsoft Corporation",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "GOOGL",
            "2. name": "Alphabet Inc.",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "AMZN",
            "2. name": "Amazon.com Inc.",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "TSLA",
            "2. name": "Tesla Inc.",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "META",
            "2. name": "Meta Platforms Inc.",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "NVDA",
            "2. name": "NVIDIA Corporation",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "JPM",
            "2. name": "JPMorgan Chase & Co.",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        }
    ]

    # Filter stocks based on keywords
    if keywords:
        results = [stock for stock in all_stocks if keywords in stock["1. symbol"] or keywords in stock["2. name"].upper()]
    else:
        results = all_stocks

    return {"bestMatches": results}

# Mock stock quotes
def get_mock_quote(symbol):
    """Return mock quote data for the given symbol."""
    # Dictionary of mock quotes for common stocks
    quotes = {
        "AAPL": {
            "01. symbol": "AAPL",
            "02. open": "175.50",
            "03. high": "178.25",
            "04. low": "174.75",
            "05. price": "177.85",
            "06. volume": "65432100",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "176.20",
            "09. change": "1.65",
            "10. change percent": "0.94%"
        },
        "MSFT": {
            "01. symbol": "MSFT",
            "02. open": "410.25",
            "03. high": "415.75",
            "04. low": "408.50",
            "05. price": "413.80",
            "06. volume": "23456700",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "409.90",
            "09. change": "3.90",
            "10. change percent": "0.95%"
        },
        "GOOGL": {
            "01. symbol": "GOOGL",
            "02. open": "175.30",
            "03. high": "177.80",
            "04. low": "174.20",
            "05. price": "176.75",
            "06. volume": "18765400",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "174.90",
            "09. change": "1.85",
            "10. change percent": "1.06%"
        },
        "AMZN": {
            "01. symbol": "AMZN",
            "02. open": "182.50",
            "03. high": "185.25",
            "04. low": "181.75",
            "05. price": "184.60",
            "06. volume": "32145600",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "183.10",
            "09. change": "1.50",
            "10. change percent": "0.82%"
        },
        "TSLA": {
            "01. symbol": "TSLA",
            "02. open": "215.75",
            "03. high": "220.50",
            "04. low": "214.25",
            "05. price": "218.90",
            "06. volume": "54321000",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "216.30",
            "09. change": "2.60",
            "10. change percent": "1.20%"
        },
        "META": {
            "01. symbol": "META",
            "02. open": "485.25",
            "03. high": "490.75",
            "04. low": "483.50",
            "05. price": "488.90",
            "06. volume": "12345600",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "484.60",
            "09. change": "4.30",
            "10. change percent": "0.89%"
        },
        "NVDA": {
            "01. symbol": "NVDA",
            "02. open": "925.50",
            "03. high": "935.25",
            "04. low": "920.75",
            "05. price": "930.80",
            "06. volume": "28765400",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "924.30",
            "09. change": "6.50",
            "10. change percent": "0.70%"
        },
        "JPM": {
            "01. symbol": "JPM",
            "02. open": "195.25",
            "03. high": "198.50",
            "04. low": "194.75",
            "05. price": "197.85",
            "06. volume": "10987600",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "196.40",
            "09. change": "1.45",
            "10. change percent": "0.74%"
        }
    }

    # Return the quote for the requested symbol, or a default if not found
    if symbol.upper() in quotes:
        return {"Global Quote": quotes[symbol.upper()]}

    # Default quote for any other symbol
    return {
        "Global Quote": {
            "01. symbol": symbol.upper(),
            "02. open": "100.00",
            "03. high": "102.50",
            "04. low": "99.25",
            "05. price": "101.75",
            "06. volume": "5000000",
            "07. latest trading day": "2025-04-20",
            "08. previous close": "100.50",
            "09. change": "1.25",
            "10. change percent": "1.24%"
        }
    }

# Mock daily time series data
def get_mock_daily_data(symbol):
    """Return mock daily time series data for the given symbol."""
    # Generate 30 days of mock data
    from datetime import datetime, timedelta
    import random

    time_series = {}
    base_price = 100.0

    # Use a fixed seed for consistent results
    random.seed(hash(symbol))

    # For known symbols, use a more realistic base price
    if symbol.upper() == "AAPL":
        base_price = 175.0
    elif symbol.upper() == "MSFT":
        base_price = 410.0
    elif symbol.upper() == "GOOGL":
        base_price = 175.0
    elif symbol.upper() == "AMZN":
        base_price = 180.0
    elif symbol.upper() == "TSLA":
        base_price = 215.0
    elif symbol.upper() == "META":
        base_price = 485.0
    elif symbol.upper() == "NVDA":
        base_price = 925.0
    elif symbol.upper() == "JPM":
        base_price = 195.0

    # Generate data for the last 30 days
    for i in range(30, 0, -1):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")

        # Generate random price movements (more realistic)
        daily_change = random.uniform(-0.02, 0.02)  # -2% to +2%
        open_price = base_price * (1 + daily_change)
        high_price = open_price * (1 + random.uniform(0, 0.015))  # Up to 1.5% higher
        low_price = open_price * (1 - random.uniform(0, 0.015))   # Up to 1.5% lower
        close_price = random.uniform(low_price, high_price)
        volume = int(random.uniform(1000000, 10000000))

        # Update base price for next day
        base_price = close_price

        time_series[date] = {
            "1. open": f"{open_price:.2f}",
            "2. high": f"{high_price:.2f}",
            "3. low": f"{low_price:.2f}",
            "4. close": f"{close_price:.2f}",
            "5. volume": str(volume)
        }

    return {
        "Meta Data": {
            "1. Information": "Daily Prices (open, high, low, close) and Volumes",
            "2. Symbol": symbol.upper(),
            "3. Last Refreshed": datetime.now().strftime("%Y-%m-%d"),
            "4. Output Size": "Compact",
            "5. Time Zone": "US/Eastern"
        },
        "Time Series (Daily)": time_series
    }
