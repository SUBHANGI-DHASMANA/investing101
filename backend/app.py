from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
import yfinance as yf
from datetime import datetime, timedelta
from supabase import create_client, Client
from functools import wraps
from rate_limiter import RateLimiter

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize rate limiter (5 calls per minute per symbol)
rate_limiter = RateLimiter(max_calls=5, period=60)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

# Flag to track if we're using mock database
using_mock_db = False

try:
    if not supabase_url or not supabase_key:
        logger.warning("Missing required environment variables. Using mock database.")
        missing_vars = []
        if not supabase_url:
            missing_vars.append("SUPABASE_URL")
        if not supabase_key:
            missing_vars.append("SUPABASE_KEY")
        logger.warning(f"Missing variables: {', '.join(missing_vars)}")

        # Import mock database
        import mock_db
        supabase = mock_db.mock_supabase
        using_mock_db = True
    else:
        # Initialize real Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    logger.error(f"Error initializing Supabase client: {str(e)}")
    logger.warning("Falling back to mock database")
    import mock_db
    supabase = mock_db.mock_supabase
    using_mock_db = True

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('user-id')
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        return f(user_id=user_id, *args, **kwargs)
    return decorated_function

# Request validation helper
def validate_request_data(data, required_fields):
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    return True, None

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Investing101 API is running",
        "environment": "Vercel" if os.environ.get("VERCEL") else "Development"
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for Vercel deployment health check"""
    return jsonify({
        "status": "online",
        "message": "Investing101 API is running. Use /api endpoints to access the API.",
        "environment": "Vercel" if os.environ.get("VERCEL") else "Development",
        "documentation": "/api/health for more information"
    })

@app.route('/api/market/search', methods=['GET'])
def search_stocks():
    """Search for stocks by keywords"""
    keywords = request.args.get('keywords', '')

    if not keywords:
        return jsonify({"error": "Keywords parameter is required"}), 400

    # Check if we're being rate limited
    if not rate_limiter.can_call("search_" + keywords):
        logger.info(f"Rate limited for search with keywords {keywords}, using mock data")
        return fallback_to_mock_search(keywords)

    try:
        # Use yfinance to search for tickers
        try:
            tickers = yf.Tickers(keywords)

            # If the exact ticker doesn't exist, try to search for similar ones
            if not tickers.tickers:
                # This is a simple approach - in a real app, you might want to use a more sophisticated search
                # For now, we'll just check if the ticker exists by trying to get its info
                try:
                    ticker = yf.Ticker(keywords)
                    info = ticker.info
                    if not info or 'symbol' not in info:
                        logger.warning(f"No symbol info found for {keywords}")
                        return fallback_to_mock_search(keywords)

                    # Format the response to match the expected format in the frontend
                    result = {
                        "bestMatches": [
                            {
                                "1. symbol": info.get('symbol', keywords),
                                "2. name": info.get('shortName', info.get('longName', keywords)),
                                "3. type": "Equity",
                                "4. region": info.get('country', "United States"),
                                "5. marketOpen": "09:30",
                                "6. marketClose": "16:00",
                                "7. timezone": "UTC-04",
                                "8. currency": info.get('currency', "USD"),
                                "9. matchScore": "1.0000"
                            }
                        ]
                    }
                    return jsonify(result)
                except Exception as e:
                    logger.error(f"Error searching for ticker {keywords}: {str(e)}")
                    return fallback_to_mock_search(keywords)

            # Format the response to match the expected format in the frontend
            result = {"bestMatches": []}
            for symbol, ticker in tickers.tickers.items():
                try:
                    info = ticker.info
                    if info and 'symbol' in info:
                        match = {
                            "1. symbol": info.get('symbol', symbol),
                            "2. name": info.get('shortName', info.get('longName', symbol)),
                            "3. type": "Equity",
                            "4. region": info.get('country', "United States"),
                            "5. marketOpen": "09:30",
                            "6. marketClose": "16:00",
                            "7. timezone": "UTC-04",
                            "8. currency": info.get('currency', "USD"),
                            "9. matchScore": "1.0000"
                        }
                        result["bestMatches"].append(match)
                except Exception as e:
                    logger.error(f"Error getting info for ticker {symbol}: {str(e)}")
                    continue

            if not result["bestMatches"]:
                logger.warning(f"No matches found for {keywords}")
                return fallback_to_mock_search(keywords)

            return jsonify(result)
        except Exception as e:
            logger.error(f"Error with yfinance Tickers for {keywords}: {str(e)}")
            return fallback_to_mock_search(keywords)
    except Exception as e:
        logger.error(f"Error searching for stocks: {str(e)}")
        return fallback_to_mock_search(keywords)

def fallback_to_mock_search(keywords):
    """Fallback to mock search results when API fails"""
    logger.info(f"Falling back to mock search results for {keywords}")

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
        keywords_upper = keywords.upper()
        results = [stock for stock in all_stocks if
                  keywords_upper in stock["1. symbol"] or
                  keywords_upper in stock["2. name"].upper()]
    else:
        results = all_stocks

    return jsonify({"bestMatches": results})

@app.route('/api/market/quote/<symbol>', methods=['GET'])
def get_stock_quote(symbol):
    """Get current quote for a stock symbol"""
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    # Check if we're being rate limited
    if not rate_limiter.can_call(symbol):
        logger.info(f"Rate limited for symbol {symbol}, using mock data")
        return fallback_to_mock_data(symbol)

    try:
        # Get stock data using yfinance with more parameters for reliability
        ticker = yf.Ticker(symbol)

        # Try to get info first to verify the symbol exists
        try:
            info = ticker.info
            if not info or 'regularMarketPrice' not in info:
                logger.warning(f"Symbol {symbol} info not available or incomplete")
                # Fall back to mock data if available
                return fallback_to_mock_data(symbol)
        except Exception as info_err:
            logger.warning(f"Error getting info for {symbol}: {str(info_err)}")
            # Continue anyway, as history might still work

        # Try different periods if 1d doesn't work
        for period in ["1d", "5d", "1mo"]:
            try:
                quote = ticker.history(period=period)
                if not quote.empty:
                    break
            except Exception as period_err:
                logger.warning(f"Error getting {period} history for {symbol}: {str(period_err)}")
                continue

        if quote.empty:
            logger.warning(f"No data found for symbol {symbol} after trying multiple periods")
            return fallback_to_mock_data(symbol)

        # Get the latest price data
        latest = quote.iloc[-1]
        prev_close = quote.iloc[0]['Close'] if len(quote) > 1 else latest['Open']

        # Calculate change and change percent
        change = latest['Close'] - prev_close
        change_percent = (change / prev_close) * 100 if prev_close > 0 else 0

        # Format the response to match the expected format in the frontend
        result = {
            "Global Quote": {
                "01. symbol": symbol,
                "02. open": str(latest['Open']),
                "03. high": str(latest['High']),
                "04. low": str(latest['Low']),
                "05. price": str(latest['Close']),
                "06. volume": str(int(latest['Volume'])),
                "07. latest trading day": quote.index[-1].strftime("%Y-%m-%d"),
                "08. previous close": str(prev_close),
                "09. change": str(round(change, 4)),
                "10. change percent": f"{round(change_percent, 4)}%"
            }
        }

        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching stock quote for {symbol}: {str(e)}")
        return fallback_to_mock_data(symbol)

def fallback_to_mock_data(symbol):
    """Fallback to mock data when API fails"""
    logger.info(f"Falling back to mock data for {symbol}")

    # Create mock data for the symbol
    mock_quote = {
        "Global Quote": {
            "01. symbol": symbol,
            "02. open": "150.00",
            "03. high": "155.00",
            "04. low": "148.00",
            "05. price": "152.50",
            "06. volume": "5000000",
            "07. latest trading day": datetime.now().strftime("%Y-%m-%d"),
            "08. previous close": "151.00",
            "09. change": "1.50",
            "10. change percent": "0.99%"
        }
    }

    # Customize data for well-known symbols
    if symbol.upper() == "AAPL":
        mock_quote["Global Quote"].update({
            "02. open": "175.50",
            "03. high": "178.25",
            "04. low": "174.75",
            "05. price": "177.85",
            "06. volume": "65432100",
            "08. previous close": "176.20",
            "09. change": "1.65",
            "10. change percent": "0.94%"
        })
    elif symbol.upper() == "MSFT":
        mock_quote["Global Quote"].update({
            "02. open": "410.25",
            "03. high": "415.75",
            "04. low": "408.50",
            "05. price": "413.80",
            "06. volume": "23456700",
            "08. previous close": "409.90",
            "09. change": "3.90",
            "10. change percent": "0.95%"
        })
    elif symbol.upper() == "GOOGL":
        mock_quote["Global Quote"].update({
            "02. open": "175.30",
            "03. high": "177.80",
            "04. low": "174.20",
            "05. price": "176.75",
            "06. volume": "18765400",
            "08. previous close": "174.90",
            "09. change": "1.85",
            "10. change percent": "1.06%"
        })
    elif symbol.upper() == "JPM":
        mock_quote["Global Quote"].update({
            "02. open": "195.25",
            "03. high": "198.50",
            "04. low": "194.75",
            "05. price": "197.85",
            "06. volume": "10987600",
            "08. previous close": "196.40",
            "09. change": "1.45",
            "10. change percent": "0.74%"
        })

    return jsonify(mock_quote)

@app.route('/api/market/daily/<symbol>', methods=['GET'])
def get_daily_data(symbol):
    """Get daily time series data for a stock symbol"""
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    # Check if we're being rate limited
    if not rate_limiter.can_call(symbol + "_daily"):
        logger.info(f"Rate limited for daily data of symbol {symbol}, using mock data")
        return fallback_to_mock_daily_data(symbol)

    try:
        # Get historical data using yfinance
        ticker = yf.Ticker(symbol)

        # Try different periods if 1mo doesn't work
        for period in ["1mo", "3mo", "6mo"]:
            try:
                hist = ticker.history(period=period)
                if not hist.empty:
                    break
            except Exception as period_err:
                logger.warning(f"Error getting {period} history for {symbol}: {str(period_err)}")
                continue

        if hist.empty:
            logger.warning(f"No daily data found for symbol {symbol} after trying multiple periods")
            return fallback_to_mock_daily_data(symbol)

        # Format the response to match the expected format in the frontend
        time_series = {}
        for date, row in hist.iterrows():
            date_str = date.strftime("%Y-%m-%d")
            time_series[date_str] = {
                "1. open": str(round(row['Open'], 4)),
                "2. high": str(round(row['High'], 4)),
                "3. low": str(round(row['Low'], 4)),
                "4. close": str(round(row['Close'], 4)),
                "5. volume": str(int(row['Volume']))
            }

        result = {
            "Meta Data": {
                "1. Information": "Daily Prices (open, high, low, close) and Volumes",
                "2. Symbol": symbol,
                "3. Last Refreshed": datetime.now().strftime("%Y-%m-%d"),
                "4. Output Size": "Compact",
                "5. Time Zone": "US/Eastern"
            },
            "Time Series (Daily)": time_series
        }

        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching daily data for {symbol}: {str(e)}")
        return fallback_to_mock_daily_data(symbol)

def fallback_to_mock_daily_data(symbol):
    """Fallback to mock daily data when API fails"""
    logger.info(f"Falling back to mock daily data for {symbol}")

    # Generate 30 days of mock data
    time_series = {}
    base_price = 100.0

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

    import random
    random.seed(hash(symbol))  # Use a fixed seed for consistent results

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

    result = {
        "Meta Data": {
            "1. Information": "Daily Prices (open, high, low, close) and Volumes",
            "2. Symbol": symbol.upper(),
            "3. Last Refreshed": datetime.now().strftime("%Y-%m-%d"),
            "4. Output Size": "Compact",
            "5. Time Zone": "US/Eastern"
        },
        "Time Series (Daily)": time_series
    }

    return jsonify(result)

@app.route('/api/user/portfolio', methods=['GET'])
@require_auth
def get_user_portfolio(user_id):
    """Get user's portfolio (requires authentication)"""
    # If using mock database, use the mock implementation
    if using_mock_db:
        try:
            portfolio = mock_db.get_user_portfolio(user_id)
            logger.info(f"Retrieved portfolio for user {user_id} from mock DB")
            return jsonify(portfolio)
        except Exception as e:
            logger.error(f"Error retrieving portfolio from mock DB for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to retrieve portfolio data"}), 500

    # Query Supabase for user's portfolio
    try:
        response = supabase.table('portfolios').select('*').eq('user_id', user_id).execute()
        logger.info(f"Retrieved portfolio for user {user_id}")
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error retrieving portfolio for user {user_id}: {str(e)}")
        # Try to fall back to mock database
        try:
            logger.warning(f"Falling back to mock database for portfolio")
            portfolio = mock_db.get_user_portfolio(user_id)
            return jsonify(portfolio)
        except Exception as mock_err:
            logger.error(f"Error with mock database fallback: {str(mock_err)}")
            return jsonify({"error": "Failed to retrieve portfolio data"}), 500

@app.route('/api/user/transactions', methods=['GET'])
@require_auth
def get_user_transactions(user_id):
    """Get user's transaction history (requires authentication)"""
    # If using mock database, use the mock implementation
    if using_mock_db:
        try:
            transactions = mock_db.get_user_transactions(user_id)
            logger.info(f"Retrieved transactions for user {user_id} from mock DB")
            return jsonify(transactions)
        except Exception as e:
            logger.error(f"Error retrieving transactions from mock DB for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to retrieve transaction data"}), 500

    # Query Supabase for user's transactions
    try:
        response = supabase.table('transactions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        logger.info(f"Retrieved transactions for user {user_id}")
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error retrieving transactions for user {user_id}: {str(e)}")
        # Try to fall back to mock database
        try:
            logger.warning(f"Falling back to mock database for transactions")
            transactions = mock_db.get_user_transactions(user_id)
            return jsonify(transactions)
        except Exception as mock_err:
            logger.error(f"Error with mock database fallback: {str(mock_err)}")
            return jsonify({"error": "Failed to retrieve transaction data"}), 500

@app.route('/api/user/transactions', methods=['POST'])
@require_auth
def create_transaction(user_id):
    """Create a new transaction (buy/sell stock)"""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate request data
    required_fields = ['symbol', 'quantity', 'price', 'type']
    is_valid, error_message = validate_request_data(data, required_fields)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    # Validate data types
    try:
        symbol = data['symbol']
        quantity = int(data['quantity'])
        price = float(data['price'])
        trade_type = data['type']

        # Additional validations
        if quantity <= 0:
            return jsonify({"error": "Quantity must be greater than zero"}), 400
        if price <= 0:
            return jsonify({"error": "Price must be greater than zero"}), 400
        if trade_type not in ['buy', 'sell']:
            return jsonify({"error": "Type must be 'buy' or 'sell'"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data types provided"}), 400

    logger.info(f"Processing {trade_type} transaction for user {user_id}: {quantity} shares of {symbol} at ${price}")

    # If using mock database, use the mock implementation
    if using_mock_db:
        try:
            transaction, new_balance = mock_db.create_transaction(
                user_id=user_id,
                symbol=symbol,
                quantity=quantity,
                price=price,
                trade_type=trade_type
            )

            return jsonify({
                "transaction": transaction,
                "new_balance": new_balance
            })
        except Exception as e:
            logger.error(f"Error creating transaction with mock DB for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to process transaction"}), 500

    # Create transaction in Supabase
    try:
        transaction_data = {
            'user_id': user_id,
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'type': trade_type,
            'total': price * quantity
        }

        # Start by checking user exists and has sufficient funds for buy orders
        user = supabase.table('users').select('cash_balance').eq('id', user_id).execute()

        if len(user.data) == 0:
            logger.error(f"User {user_id} not found in database")
            return jsonify({"error": "User not found"}), 404

        current_balance = user.data[0]['cash_balance']

        # For buy orders, check if user has enough funds
        if trade_type == 'buy':
            total_cost = price * quantity
            if total_cost > current_balance:
                logger.warning(f"Insufficient funds for user {user_id}: has ${current_balance}, needs ${total_cost}")
                return jsonify({"error": "Insufficient funds for this purchase"}), 400

        # Get current portfolio
        portfolio = supabase.table('portfolios').select('*').eq('user_id', user_id).eq('symbol', symbol).execute()

        # For sell orders, check if user has enough shares
        if trade_type == 'sell':
            if len(portfolio.data) == 0 or portfolio.data[0]['quantity'] < quantity:
                logger.warning(f"Insufficient shares for user {user_id} to sell {quantity} of {symbol}")
                return jsonify({"error": "Not enough shares to sell"}), 400

        # Create the transaction record
        response = supabase.table('transactions').insert(transaction_data).execute()

        if trade_type == 'buy':
            if len(portfolio.data) == 0:
                # Create new portfolio entry
                portfolio_data = {
                    'user_id': user_id,
                    'symbol': symbol,
                    'quantity': quantity,
                    'avg_price': price
                }
                logger.info(f"Creating new portfolio entry for user {user_id}: {quantity} shares of {symbol}")
                supabase.table('portfolios').insert(portfolio_data).execute()
            else:
                # Update existing portfolio
                current = portfolio.data[0]
                new_quantity = current['quantity'] + quantity
                new_avg_price = ((current['quantity'] * current['avg_price']) + (quantity * price)) / new_quantity
                logger.info(f"Updating portfolio for user {user_id}: {symbol} from {current['quantity']} to {new_quantity} shares")

                supabase.table('portfolios').update({
                    'quantity': new_quantity,
                    'avg_price': new_avg_price
                }).eq('id', current['id']).execute()

        elif trade_type == 'sell':
            current = portfolio.data[0]
            new_quantity = current['quantity'] - quantity
            logger.info(f"Selling shares for user {user_id}: {symbol} from {current['quantity']} to {new_quantity} shares")

            if new_quantity == 0:
                # Remove from portfolio if all shares sold
                supabase.table('portfolios').delete().eq('id', current['id']).execute()
                logger.info(f"Removed {symbol} from user {user_id}'s portfolio (all shares sold)")
            else:
                # Update quantity (avg_price stays the same when selling)
                supabase.table('portfolios').update({
                    'quantity': new_quantity
                }).eq('id', current['id']).execute()

        # Update user's cash balance
        cash_change = -price * quantity if trade_type == 'buy' else price * quantity
        new_balance = current_balance + cash_change
        logger.info(f"Updating user {user_id}'s balance from ${current_balance} to ${new_balance}")

        supabase.table('users').update({
            'cash_balance': new_balance
        }).eq('id', user_id).execute()

        return jsonify({
            "transaction": response.data,
            "new_balance": new_balance
        })

    except Exception as e:
        logger.error(f"Error creating transaction for user {user_id}: {str(e)}")
        # Try to fall back to mock database if Supabase fails
        try:
            logger.warning(f"Falling back to mock database for transaction")
            transaction, new_balance = mock_db.create_transaction(
                user_id=user_id,
                symbol=symbol,
                quantity=quantity,
                price=price,
                trade_type=trade_type
            )

            return jsonify({
                "transaction": transaction,
                "new_balance": new_balance
            })
        except Exception as mock_err:
            logger.error(f"Error with mock database fallback: {str(mock_err)}")
            return jsonify({"error": "Failed to process transaction"}), 500

@app.route('/api/user/balance', methods=['GET'])
@require_auth
def get_user_balance(user_id):
    """Get user's cash balance"""
    # If using mock database, use the mock implementation
    if using_mock_db:
        try:
            balance = mock_db.get_user_balance(user_id)
            if balance is None:
                logger.warning(f"User {user_id} not found in mock DB when retrieving balance")
                return jsonify({"error": "User not found"}), 404

            logger.info(f"Retrieved balance for user {user_id} from mock DB")
            return jsonify({"cash_balance": balance})
        except Exception as e:
            logger.error(f"Error retrieving balance from mock DB for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to retrieve balance"}), 500

    # Query Supabase for user's balance
    try:
        response = supabase.table('users').select('cash_balance').eq('id', user_id).execute()

        if len(response.data) == 0:
            logger.warning(f"User {user_id} not found when retrieving balance")
            # Try to fall back to mock database
            try:
                logger.warning(f"Falling back to mock database for balance")
                balance = mock_db.get_user_balance(user_id)
                if balance is not None:
                    return jsonify({"cash_balance": balance})
                return jsonify({"error": "User not found"}), 404
            except Exception as mock_err:
                logger.error(f"Error with mock database fallback: {str(mock_err)}")
                return jsonify({"error": "User not found"}), 404

        logger.info(f"Retrieved balance for user {user_id}")
        return jsonify({"cash_balance": response.data[0]['cash_balance']})

    except Exception as e:
        logger.error(f"Error retrieving balance for user {user_id}: {str(e)}")
        # Try to fall back to mock database
        try:
            logger.warning(f"Falling back to mock database for balance")
            balance = mock_db.get_user_balance(user_id)
            if balance is not None:
                return jsonify({"cash_balance": balance})
            return jsonify({"error": "Failed to retrieve balance"}), 500
        except Exception as mock_err:
            logger.error(f"Error with mock database fallback: {str(mock_err)}")
            return jsonify({"error": "Failed to retrieve balance"}), 500

# Error handler for all 500 errors
@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {str(e)}")
    return jsonify({"error": "An unexpected error occurred"}), 500

# Error handler for 404 errors
@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "Resource not found"}), 404

# Error handler for 405 errors
@app.errorhandler(405)
def method_not_allowed(_):
    return jsonify({"error": "Method not allowed"}), 405

# Only run the server directly when not on Vercel
if __name__ == '__main__':
    logger.info("Starting Investment Demo API server")
    app.run(debug=True, host='0.0.0.0', port=8081)
