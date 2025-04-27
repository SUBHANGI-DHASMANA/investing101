"""
Simple rate limiter to prevent too many requests to external APIs.
"""
import time
from collections import defaultdict

class RateLimiter:
    """
    A simple rate limiter that limits requests to a certain number per time period.
    """
    def __init__(self, max_calls=5, period=60):
        """
        Initialize the rate limiter.
        
        Args:
            max_calls: Maximum number of calls allowed in the period
            period: Time period in seconds
        """
        self.max_calls = max_calls
        self.period = period
        self.calls = defaultdict(list)
    
    def can_call(self, key):
        """
        Check if a call can be made for the given key.
        
        Args:
            key: The key to check (e.g., a stock symbol)
            
        Returns:
            True if the call can be made, False otherwise
        """
        current_time = time.time()
        
        # Remove calls older than the period
        self.calls[key] = [call_time for call_time in self.calls[key] 
                          if current_time - call_time < self.period]
        
        # Check if we've made too many calls
        if len(self.calls[key]) >= self.max_calls:
            return False
        
        # Add the current call
        self.calls[key].append(current_time)
        return True
