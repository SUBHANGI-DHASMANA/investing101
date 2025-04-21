# Investment Demo Backend

This is the Flask backend for the Investment Demo application.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and fill in your credentials:
   - Supabase URL and key
   - Alpha Vantage API key

5. Run the application:
   ```
   python app.py
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Market Data
- `GET /api/market/search?keywords=<search_term>` - Search for stocks
- `GET /api/market/quote/<symbol>` - Get current quote for a stock
- `GET /api/market/daily/<symbol>` - Get daily time series data for a stock

### User Data (requires authentication)
- `GET /api/user/portfolio` - Get user's portfolio
- `GET /api/user/transactions` - Get user's transaction history
- `POST /api/user/transactions` - Create a new transaction (buy/sell)
- `GET /api/user/balance` - Get user's cash balance
