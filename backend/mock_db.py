"""
Mock database service for the Investing101 application.
This provides hardcoded data for development and testing when Supabase is unavailable.
"""
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

# Mock user data
mock_users = {
    "user123": {
        "id": "user123",
        "email": "user@example.com",
        "cash_balance": 93273.40
    }
}

# Mock portfolio data
mock_portfolios = [
    {
        "id": "1",
        "user_id": "user123",
        "symbol": "AAPL",
        "quantity": 10,
        "avg_price": 150.25,
        "created_at": "2025-04-15T14:30:00Z",
        "updated_at": "2025-04-15T14:30:00Z"
    },
    {
        "id": "2",
        "user_id": "user123",
        "symbol": "MSFT",
        "quantity": 5,
        "avg_price": 380.50,
        "created_at": "2025-04-16T10:15:00Z",
        "updated_at": "2025-04-16T10:15:00Z"
    },
    {
        "id": "3",
        "user_id": "user123",
        "symbol": "GOOGL",
        "quantity": 8,
        "avg_price": 160.30,
        "created_at": "2025-04-17T09:45:00Z",
        "updated_at": "2025-04-17T09:45:00Z"
    }
]

# Mock transaction data
mock_transactions = [
    {
        "id": "1",
        "user_id": "user123",
        "symbol": "AAPL",
        "quantity": 10,
        "price": 150.25,
        "type": "buy",
        "total": 1502.50,
        "created_at": "2025-04-15T14:30:00Z",
        "status": "COMPLETED"
    },
    {
        "id": "2",
        "user_id": "user123",
        "symbol": "MSFT",
        "quantity": 5,
        "price": 380.50,
        "type": "buy",
        "total": 1902.50,
        "created_at": "2025-04-16T10:15:00Z",
        "status": "COMPLETED"
    },
    {
        "id": "3",
        "user_id": "user123",
        "symbol": "GOOGL",
        "quantity": 8,
        "price": 160.30,
        "type": "buy",
        "total": 1282.40,
        "created_at": "2025-04-17T09:45:00Z",
        "status": "COMPLETED"
    }
]

class MockTable:
    def __init__(self, data):
        self.data = data
        self.name = "mock_table"
    
    def select(self, *fields):
        return self
    
    def eq(self, field, value):
        return self
    
    def order(self, field, desc=False):
        return self
    
    def execute(self):
        return MockResponse(self.data)
    
    def insert(self, data):
        return MockInsert(self.data, data)
    
    def update(self, data):
        return MockUpdate(self.data, data)
    
    def delete(self):
        return self

class MockResponse:
    def __init__(self, data):
        self.data = data

class MockInsert:
    def __init__(self, table_data, insert_data):
        self.table_data = table_data
        self.insert_data = insert_data
        
        # Add an ID if not present
        if "id" not in self.insert_data:
            self.insert_data["id"] = str(uuid.uuid4())
        
        # Add timestamps if not present
        if "created_at" not in self.insert_data:
            self.insert_data["created_at"] = datetime.now().isoformat()
        
        if "updated_at" not in self.insert_data:
            self.insert_data["updated_at"] = datetime.now().isoformat()
    
    def select(self):
        # Add the data to the table
        self.table_data.append(self.insert_data)
        return MockResponse([self.insert_data])

class MockUpdate:
    def __init__(self, table_data, update_data):
        self.table_data = table_data
        self.update_data = update_data
        self.filter_field = None
        self.filter_value = None
    
    def eq(self, field, value):
        self.filter_field = field
        self.filter_value = value
        return self
    
    def execute(self):
        # Find the item to update
        for item in self.table_data:
            if item.get(self.filter_field) == self.filter_value:
                # Update the item
                for key, value in self.update_data.items():
                    item[key] = value
                
                # Update the timestamp
                item["updated_at"] = datetime.now().isoformat()
                
                return MockResponse([item])
        
        return MockResponse([])

class MockSupabase:
    def __init__(self):
        self.tables = {
            "users": mock_users,
            "portfolios": mock_portfolios,
            "transactions": mock_transactions
        }
    
    def table(self, name):
        if name == "users":
            # For users, we need to handle it differently since it's a dictionary
            user_list = [user for user in self.tables["users"].values()]
            return MockTable(user_list)
        return MockTable(self.tables.get(name, []))

# Create a mock Supabase client
mock_supabase = MockSupabase()

def get_user_portfolio(user_id):
    """Get user's portfolio"""
    # Filter the portfolio data by user_id
    portfolio = [item for item in mock_portfolios if item["user_id"] == user_id]
    return portfolio

def get_user_transactions(user_id):
    """Get user's transaction history"""
    # Filter the transaction data by user_id
    transactions = [item for item in mock_transactions if item["user_id"] == user_id]
    return transactions

def get_user_balance(user_id):
    """Get user's cash balance"""
    # Get the user data
    user = mock_users.get(user_id)
    if user:
        return user["cash_balance"]
    return None

def create_transaction(user_id, symbol, quantity, price, trade_type):
    """Create a new transaction"""
    # Calculate the total
    total = price * quantity
    
    # Create the transaction data
    transaction_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "symbol": symbol,
        "quantity": quantity,
        "price": price,
        "type": trade_type,
        "total": total,
        "created_at": datetime.now().isoformat(),
        "status": "COMPLETED"
    }
    
    # Add the transaction to the mock data
    mock_transactions.append(transaction_data)
    
    # Update the user's cash balance
    user = mock_users.get(user_id)
    if user:
        if trade_type == "buy":
            user["cash_balance"] -= total
        else:
            user["cash_balance"] += total
    
    # Update the user's portfolio
    portfolio_item = None
    for item in mock_portfolios:
        if item["user_id"] == user_id and item["symbol"] == symbol:
            portfolio_item = item
            break
    
    if trade_type == "buy":
        if portfolio_item:
            # Update existing portfolio item
            new_quantity = portfolio_item["quantity"] + quantity
            new_avg_price = ((portfolio_item["quantity"] * portfolio_item["avg_price"]) + (quantity * price)) / new_quantity
            portfolio_item["quantity"] = new_quantity
            portfolio_item["avg_price"] = new_avg_price
            portfolio_item["updated_at"] = datetime.now().isoformat()
        else:
            # Create new portfolio item
            portfolio_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "symbol": symbol,
                "quantity": quantity,
                "avg_price": price,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            mock_portfolios.append(portfolio_data)
    elif trade_type == "sell" and portfolio_item:
        # Update existing portfolio item
        new_quantity = portfolio_item["quantity"] - quantity
        if new_quantity <= 0:
            # Remove the portfolio item if all shares are sold
            mock_portfolios.remove(portfolio_item)
        else:
            portfolio_item["quantity"] = new_quantity
            portfolio_item["updated_at"] = datetime.now().isoformat()
    
    return transaction_data, user["cash_balance"] if user else None
