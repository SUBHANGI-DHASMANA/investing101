# Investing101 - Investment Learning Platform

Investing101 is a web application that allows users to practice investing with dummy cash and real market data. It provides a risk-free environment for learning how to invest in the stock market.

### Prototype Link: https://www.figma.com/proto/HndkpmxABYUtVHfUwjJT3d/Investing101?node-id=5-79&t=Oqckis7P8FBoUXrD-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1

## Product Requirements Document (PRD)

### Overview and Objectives

Investing101 aims to bridge the knowledge gap in financial literacy by providing a safe, educational platform for users to learn investment concepts through practical experience. The platform simulates real market conditions without the financial risk, allowing users to develop investment skills before committing actual capital.

**Key Objectives:**
- Reduce the barrier to entry for new investors
- Provide practical investment education through experiential learning
- Build user confidence in making investment decisions
- Create a community of informed investors

### Target Audience

- College students interested in finance and investing
- Young professionals starting to build wealth
- Career changers exploring finance industry
- Educators teaching financial literacy
- Anyone intimidated by real-world investing

### User Stories

**As a beginner investor:**
- I want to practice buying and selling stocks without risking real money
- I want to understand how market fluctuations affect my portfolio
- I want simple explanations of investment terms and concepts
- I want to track my investment performance over time

**As an educator:**
- I want to create classroom investment competitions
- I want to demonstrate various investment strategies to students
- I want to provide a hands-on learning tool for financial concepts
- I want to track student progress and engagement

**As a finance enthusiast:**
- I want to test different investment strategies in parallel
- I want to compare my performance against market benchmarks
- I want to analyze my transaction history for patterns
- I want to participate in community discussions about investment approaches

### Team Responsibilities

| Team | Responsibilities | Deliverables | Timeline |
|------|-----------------|--------------|----------|
| **Product Management** | Define product vision, prioritize features, manage roadmap | PRD, user stories, feature specifications | Ongoing |
| **UX/UI Design** | Create intuitive user interfaces, design user flows, conduct usability testing | Wireframes, prototypes, design system | Weeks 1-4 |
| **Frontend Development** | Implement responsive UI, integrate with backend APIs, optimize performance | Next.js application, component library | Weeks 3-10 |
| **Backend Development** | Build APIs, implement business logic, manage data integrity | Flask API endpoints, database models | Weeks 3-10 |
| **Data Engineering** | Set up market data integration, optimize data retrieval, implement caching | Data pipelines, market data service | Weeks 5-8 |
| **QA & Testing** | Ensure product quality, identify bugs, validate features | Test plans, automated tests, bug reports | Weeks 8-12 |
| **DevOps** | Set up deployment pipelines, monitor performance, ensure scalability | CI/CD pipelines, monitoring dashboards | Weeks 9-12 |

### Success Metrics

- **User Engagement**: Average session duration > 15 minutes
- **User Growth**: 20% month-over-month growth in registered users
- **Learning Outcomes**: 70% of users report increased confidence in investment knowledge
- **Feature Adoption**: 80% of active users complete at least one trade per week
- **Retention**: 60% of users return to the platform within 30 days

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
