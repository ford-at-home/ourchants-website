// Development-only API request logger
export const logApiRequest = (method: string, url: string, request?: any, response?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`API Request: ${method} ${url}`);
    console.log('Request:', request);
    console.log('Response:', response);
    console.groupEnd();
  }
};

// Development-only API error logger
export const logApiError = (method: string, url: string, error: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`API Error: ${method} ${url}`);
    console.error('Error:', error);
    console.groupEnd();
  }
}; 