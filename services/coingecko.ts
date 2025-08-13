
import type { Coin, ChartDataPoint } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

async function fetchAPI<T,>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    throw new Error(errorData.error || 'Failed to fetch data from CoinGecko API');
  }
  return response.json() as Promise<T>;
}

export const getCoinsMarkets = async (currency: string, page: number = 1, perPage: number = 10): Promise<Coin[]> => {
  return fetchAPI<Coin[]>(`coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`);
};

export const getCoinMarketChart = async (coinId: string, days: number, currency: string): Promise<ChartDataPoint[]> => {
    // By removing the 'interval' parameter, we let CoinGecko automatically select the best data granularity.
    // This fixes the fetch error for the 24H view and improves granularity for other views (e.g., 7D, 30D).
    const data = await fetchAPI<{ prices: [number, number][] }>(`coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`);
    
    return data.prices.map((pricePoint: [number, number]): ChartDataPoint => {
        const date = new Date(pricePoint[0]);
        let formattedDate: string;

        if (days <= 1) {
            // For 24H view, show time
            formattedDate = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (days <= 90) {
            // For hourly data (up to 90 days), show date and hour for clarity
            formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
        } else {
            // For daily data (>90 days), show just the date
            formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      
        return {
            date: formattedDate,
            price: pricePoint[1],
        };
    });
};
