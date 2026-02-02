/**
 * API Configuration
 * Handles API base URLs for development and production environments
 */

const getEnvironmentInfo = () => {
  if (typeof window === 'undefined') {
    return { isDevelopment: false, isLocalhost: false, mode: 'production' };
  }

  const isDevelopment = import.meta.env?.MODE === 'development';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return { isDevelopment, isLocalhost, mode: import.meta.env?.MODE || 'production' };
};

export const getApiBaseUrl = () => {
  return '/api/v2';
};

export const API_ENDPOINTS = {
  get PAYMENT() {
    return `${getApiBaseUrl()}/payment.php`;
  },
  get RAZORPAY_CREATE_ORDER() {
    return `${getApiBaseUrl()}/razorpay/create_order.php`;
  },
  get RAZORPAY_NONSEAMLESS() {
    return `${getApiBaseUrl()}/razorpay/razorpay_nonseamless.php`;
  },
  get PAYMENT_CALLBACK() {
    return `${getApiBaseUrl()}/payment_callback.php`;
  }
};

export const makeApiCall = async (endpoint, data) => {
  const payload = new URLSearchParams(data);

  console.log('📤 API Call:', { endpoint, data: Object.fromEntries(payload.entries()) });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload
  });

  const responseText = await response.text();
  console.log('📥 API Response:', responseText.substring(0, 500));

  try {
    const jsonResponse = JSON.parse(responseText);
    console.log('✅ Parsed:', jsonResponse);
    return jsonResponse;
  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError);
    throw new Error(`Invalid JSON: ${responseText.substring(0, 200)}`);
  }
};

export const getEnvInfo = () => {
  const envInfo = getEnvironmentInfo();
  return {
    ...envInfo,
    apiBaseUrl: getApiBaseUrl(),
    usingProxy: envInfo.isDevelopment && envInfo.isLocalhost
  };
};

if (typeof window !== 'undefined') {
  console.log('🌍 API Environment:', getEnvInfo());
}