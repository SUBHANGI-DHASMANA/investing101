# Investing101 - Investment Learning Platform

Investing101 is a web application that allows users to practice investing with dummy cash and real market data. It provides a risk-free environment for learning how to invest in the stock market.

### Prototype Link: https://www.figma.com/proto/HndkpmxABYUtVHfUwjJT3d/Untitled?node-id=5-79&p=f&t=k0vKC7vcyyLmSlRI-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1

## Features

- **Virtual Portfolio**: Start with dummy cash and build your investment portfolio
- **Real Market Data**: Access real-time stock market data via Yahoo Finance
- **Buy & Sell Stocks**: Practice trading with virtual money
- **Portfolio Tracking**: Monitor your investment performance
- **Transaction History**: Keep track of all your trades

## Tech Stack

### Frontend
- **Framework**: Next.js
- **UI Components**: Material UI
- **Deployment**: Vercel

### Backend
- **Framework**: Flask (Python)
- **Database**: Supabase
- **Market Data**: Yahoo Finance (yfinance)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.8 or later)
- Supabase account
- No external API key needed (yfinance is used)

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file and add your environment variables.

4. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file and add your environment variables.

5. Start the Flask server:
   ```
   python app.py
   ```

6. The backend API will be available at http://localhost:8081/api

## Database Setup

1. Create a new project in Supabase
2. Create the following tables:
   - users
   - portfolios
   - transactions

## Deployment

### Frontend (Vercel)
1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

### Backend
1. Deploy to your preferred hosting platform (Heroku, AWS, etc.)
2. Configure environment variables

## License

This product is for educational purposes only.

## Acknowledgements

- [Yahoo Finance](https://finance.yahoo.com/) for market data
- [Supabase](https://supabase.io/) for database and authentication
- [Next.js](https://nextjs.org/) and [Material UI](https://mui.com/) for frontend
- [Flask](https://flask.palletsprojects.com/) for backend
