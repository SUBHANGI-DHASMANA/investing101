from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
# import yfinance as yf  # Commented out for now
from datetime import datetime
# Import our mock data module
import mock_data
from supabase import create_client, Client
from functools import wraps

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

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Check if required environment variables are set
if not supabase_url or not supabase_key:
    logger.error("Missing required environment variables. Please check your .env file.")
    missing_vars = []
    if not supabase_url:
        missing_vars.append("SUPABASE_URL")
    if not supabase_key:
        missing_vars.append("SUPABASE_KEY")
    logger.error(f"Missing variables: {', '.join(missing_vars)}")

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
    return jsonify({"status": "healthy", "message": "Investing101 API is running"})

@app.route('/api/market/search', methods=['GET'])
def search_stocks():
    """Search for stocks by keywords"""
    keywords = request.args.get('keywords', '')

    if not keywords:
        return jsonify({"error": "Keywords parameter is required"}), 400

    try:
        # Use our mock data instead of yfinance
        result = mock_data.get_mock_search_results(keywords)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error searching for stocks: {str(e)}")
        return jsonify({"error": "Error searching for stocks"}), 500

    # Original yfinance implementation (commented out)
    '''
    try:
        # Use yfinance to search for tickers
        tickers = yf.Tickers(keywords)

        # If the exact ticker doesn't exist, try to search for similar ones
        if not tickers.tickers:
            # This is a simple approach - in a real app, you might want to use a more sophisticated search
            # For now, we'll just check if the ticker exists by trying to get its info
            try:
                ticker = yf.Ticker(keywords)
                info = ticker.info
                if 'symbol' not in info:
                    return jsonify({"bestMatches": []}), 200

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
                return jsonify({"bestMatches": []}), 200

        # Format the response to match the expected format in the frontend
        result = {"bestMatches": []}
        for symbol, ticker in tickers.tickers.items():
            try:
                info = ticker.info
                if 'symbol' in info:
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

        return jsonify(result)
    except Exception as e:
        logger.error(f"Error searching for stocks: {str(e)}")
        return jsonify({"error": "Error searching for stocks"}), 500
    '''

@app.route('/api/market/quote/<symbol>', methods=['GET'])
def get_stock_quote(symbol):
    """Get current quote for a stock symbol"""
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    try:
        # Use our mock data instead of yfinance
        result = mock_data.get_mock_quote(symbol)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching stock quote for {symbol}: {str(e)}")
        return jsonify({"error": "Error fetching stock data"}), 500

    # Original yfinance implementation (commented out)
    '''
    try:
        # Get stock data using yfinance
        ticker = yf.Ticker(symbol)

        # Get the latest quote
        quote = ticker.history(period="1d")

        if quote.empty:
            return jsonify({"error": "No data found for this symbol"}), 404

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
        return jsonify({"error": "Error fetching stock data"}), 500
    '''

@app.route('/api/market/daily/<symbol>', methods=['GET'])
def get_daily_data(symbol):
    """Get daily time series data for a stock symbol"""
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    try:
        # Use our mock data instead of yfinance
        result = mock_data.get_mock_daily_data(symbol)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching daily data for {symbol}: {str(e)}")
        return jsonify({"error": "Error fetching stock data"}), 500

    # Original yfinance implementation (commented out)
    '''
    try:
        # Get historical data using yfinance
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1mo")  # Get 1 month of data

        if hist.empty:
            return jsonify({"error": "No daily data found for this symbol"}), 404

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
        return jsonify({"error": "Error fetching stock data"}), 500
    '''

@app.route('/api/user/portfolio', methods=['GET'])
@require_auth
def get_user_portfolio(user_id):
    """Get user's portfolio (requires authentication)"""
    # Query Supabase for user's portfolio
    try:
        response = supabase.table('portfolios').select('*').eq('user_id', user_id).execute()
        logger.info(f"Retrieved portfolio for user {user_id}")
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error retrieving portfolio for user {user_id}: {str(e)}")
        return jsonify({"error": "Failed to retrieve portfolio data"}), 500

@app.route('/api/user/transactions', methods=['GET'])
@require_auth
def get_user_transactions(user_id):
    """Get user's transaction history (requires authentication)"""
    # Query Supabase for user's transactions
    try:
        response = supabase.table('transactions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        logger.info(f"Retrieved transactions for user {user_id}")
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error retrieving transactions for user {user_id}: {str(e)}")
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
        return jsonify({"error": "Failed to process transaction"}), 500

@app.route('/api/user/balance', methods=['GET'])
@require_auth
def get_user_balance(user_id):
    """Get user's cash balance"""
    try:
        response = supabase.table('users').select('cash_balance').eq('id', user_id).execute()

        if len(response.data) == 0:
            logger.warning(f"User {user_id} not found when retrieving balance")
            return jsonify({"error": "User not found"}), 404

        logger.info(f"Retrieved balance for user {user_id}")
        return jsonify({"cash_balance": response.data[0]['cash_balance']})

    except Exception as e:
        logger.error(f"Error retrieving balance for user {user_id}: {str(e)}")
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

if __name__ == '__main__':
    logger.info("Starting Investment Demo API server")
    app.run(debug=True, host='0.0.0.0', port=8081)
