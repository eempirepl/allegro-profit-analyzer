import dotenv from 'dotenv';

dotenv.config();

export const baseLinkerConfig = {
  apiToken: process.env.BASELINKER_API_TOKEN || '',
  apiUrl: 'https://api.baselinker.com/connector.php',
  maxConcurrentRequests: 5,
  minTimeBetweenRequests: 600, // 600ms = 100 requests per minute
  defaults: {
    pageSize: 100,
    orderDateRange: {
      days: 30
    }
  }
}; 