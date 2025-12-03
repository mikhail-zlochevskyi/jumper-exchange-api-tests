export const config = {
  baseURL: process.env.LIFI_BASE_URL || 'https://li.quest/v1',
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  apiKey: process.env.LIFI_API_KEY,
};


