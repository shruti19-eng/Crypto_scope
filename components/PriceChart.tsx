
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ChartDataPoint } from '../types';

interface PriceChartProps {
  data: ChartDataPoint[];
  currency: string;
  days: number;
}

const getLocale = (currency: string) => currency.toLowerCase() === 'inr' ? 'en-IN' : 'en-US';

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(getLocale(currency), {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-gray-700 p-2 shadow-lg border border-gray-600">
        <p className="label text-sm text-gray-300">{`${label}`}</p>
        <p className="intro text-white font-bold">{formatCurrency(payload[0].value, currency)}</p>
      </div>
    );
  }
  return null;
};


const PriceChart: React.FC<PriceChartProps> = ({ data, currency, days }) => {
    const yAxisFormatter = (value: number) => {
        const symbol = new Intl.NumberFormat(getLocale(currency), { style: 'currency', currency: currency.toUpperCase() }).formatToParts(1).find(part => part.type === 'currency')?.value || '$';
        const formattedValue = new Intl.NumberFormat('en-US', {notation: 'compact', compactDisplay: 'short'}).format(value);
        return `${symbol}${formattedValue}`;
    }

  return (
    <div className="h-[28rem] w-full bg-gray-800 p-4 rounded-lg shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 15,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} domain={['dataMin', 'dataMax']} />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(128, 179, 219, 0.1)' }} wrapperStyle={{ outline: 'none' }}/>
          {days === 1 && data && data.length > 0 && (
              <ReferenceLine 
                y={data[0].price} 
                label={{ value: 'Open', position: 'insideTopLeft', fill: 'rgba(160, 174, 192, 0.8)', fontSize: 12 }} 
                stroke="rgba(160, 174, 192, 0.5)" 
                strokeDasharray="3 3" 
              />
          )}
          <Line type="monotone" dataKey="price" stroke="#38BDF8" strokeWidth={2} dot={false} name={`Price (${currency.toUpperCase()})`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
