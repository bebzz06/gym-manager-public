import httpClient from '@/http';

httpClient.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout - please try again'));
    }
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      return Promise.reject(new Error('Network error - please check your connection'));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout - please try again'));
    }

    // Add rate limit metadata to the error object
    if (error.response.status === 429) {
      error.isRateLimit = true;
      error.retryAfter = error.response.headers['retry-after'];
    }

    return Promise.reject(error);
  }
);

export default httpClient;
