const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Error logging handled by logger utility
    let errorMessage = 'Unable to submit form. Please try again.';
    
    if (isJson) {
      // Handle validation errors
      if (payload.errors && Array.isArray(payload.errors)) {
        errorMessage = payload.errors.join('. ');
      } else if (payload.message) {
        errorMessage = payload.message;
      }
    } else {
      errorMessage = payload || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return payload;
}

export async function submitCourseForm(data) {
  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for payment processing
  
  try {
    response = await fetch(`${DEFAULT_API_BASE_URL}/course/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    // Network errors - provide helpful message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and ensure the backend is running.');
    }
    throw new Error(error.message || 'Unable to reach the enrollment API. Please check your connection and try again.');
  }

  const payload = await handleResponse(response);

  if (!payload?.checkoutUrl) {
    throw new Error('Payment link missing from server response.');
  }

  return payload;
}

export { DEFAULT_API_BASE_URL };

