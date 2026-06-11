import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import type { DamageStats } from '../types/damage';

interface DailyStat {
  date: string;
  count: number;
}

interface CountryStat {
  country: string;
  count: number;
}

export const Analytics: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [typeStats, setTypeStats] = useState<DamageStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, typeRes, countryRes] = await Promise.all([
          fetch('/api/damages/stats/daily'),
          fetch('/api/damages/stats/types'),
          fetch('/api/damages/stats/countries')
        ]);

        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setDailyStats(data.map((row: any) => ({ date: row[0], count: row[1] })));
        }
        if (typeRes.ok) {
          setTypeStats(await typeRes.json());
        }
        if (countryRes.ok) {
          setCountryStats(await countryRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg bg-surface-container-lowest min-h-full">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">데이터 분석 및 통계</h2>
        <p className="text-on-surface-variant text-sm">전체 도로 손상 데이터의 추세와 분포를 시각적으로 분석합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Trend Chart */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px]">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">일별 손상 보고 추세</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px]">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">손상 유형별 비중</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="damageType"
                >
                  {typeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Comparison */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px] lg:col-span-2">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">국가별 데이터 발생량 비교</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="country" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F1F5F9'}} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                  {countryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
