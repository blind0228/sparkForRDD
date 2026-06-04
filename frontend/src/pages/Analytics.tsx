import React, { useEffect, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, ComposedChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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

interface CountryTypeStat {
  country: string;
  type: string;
  count: number;
}

export const Analytics: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [typeStats, setTypeStats] = useState<DamageStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [countryTypeStats, setCountryTypeStats] = useState<CountryTypeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, typeRes, countryRes, ctRes] = await Promise.all([
          fetch('/api/damages/stats/daily'),
          fetch('/api/damages/stats/types'),
          fetch('/api/damages/stats/countries'),
          fetch('/api/damages/stats/country-types')
        ]);

        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setDailyStats(data.map((row: any) => ({ date: row[0], count: row[1] })));
        }
        if (typeRes.ok) setTypeStats(await typeRes.json());
        if (countryRes.ok) setCountryStats(await countryRes.json());
        if (ctRes.ok) {
          const data = await ctRes.json();
          setCountryTypeStats(data.map((row: any) => ({ country: row[0], type: row[1], count: row[2] })));
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#0058be', '#2170e4', '#59a2ff', '#9dc7ff', '#cfdfff'];
  const CATEGORY_COLORS: Record<string, string> = {
    D00: '#545f73',
    D10: '#2170e4',
    D20: '#0058be',
    D40: '#ba1a1a',
  };

  const totalMarkers = countryStats.reduce((acc, c) => acc + c.count, 0);
  const totalLabels = typeStats.reduce((acc, t) => acc + t.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg bg-surface-container-lowest min-h-full pb-2xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">종합 데이터 분석</h2>
          <p className="text-on-surface-variant text-sm">글로벌 도로 손상 현황에 대한 다각도 시각적 인사이트를 제공합니다.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm">
          <p className="text-[10px] font-bold text-outline uppercase">총 관측 지점</p>
          <p className="text-2xl font-display font-bold text-on-surface mt-xs">{totalMarkers.toLocaleString()}<span className="text-xs font-normal ml-1">건</span></p>
        </div>
        <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm">
          <p className="text-[10px] font-bold text-outline uppercase">총 파손 레이블</p>
          <p className="text-2xl font-display font-bold text-primary mt-xs">{totalLabels.toLocaleString()}<span className="text-xs font-normal ml-1">개</span></p>
        </div>
        <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm">
          <p className="text-[10px] font-bold text-outline uppercase">지점당 평균 파손</p>
          <p className="text-2xl font-display font-bold text-on-surface mt-xs">{(totalLabels / totalMarkers).toFixed(2)}<span className="text-xs font-normal ml-1">개</span></p>
        </div>
        <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm">
          <p className="text-[10px] font-bold text-outline uppercase">최다 발생 국가</p>
          <p className="text-2xl font-display font-bold text-error mt-xs">{countryStats[0]?.country || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Trend Composed Chart */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px] lg:col-span-2">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">일별 감지 추세 및 누적 성장</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} name="일일 건수" />
                <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} dot={false} name="추세선" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart for Type Comparison */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px]">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">파손 유형 특성 분석</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={typeStats}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="damageType" tick={{fontSize: 11}} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fontSize: 9}} />
                <Radar
                  name="파손 건수"
                  dataKey="count"
                  stroke="#0058be"
                  fill="#0058be"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Damage Type Share Pie */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px]">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">글로벌 파손 유형 비중</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="damageType"
                >
                  {typeStats.map((entry) => (
                    <Cell key={entry.damageType} fill={CATEGORY_COLORS[entry.damageType] || '#CBD5E1'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px', fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Breakdown Bar */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col h-[400px] lg:col-span-2">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">국가별 데이터 점유율</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={countryStats} margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                  {countryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Grid (Table-based visualization) */}
        <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-sm flex flex-col lg:col-span-3">
          <h3 className="font-display text-md font-bold mb-md text-on-surface">국가별 파손 유형 상세 매트릭스</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-sm px-md text-left text-xs font-bold text-outline">국가 / 파손코드</th>
                  {typeStats.map(t => (
                    <th key={t.damageType} className="py-sm px-md text-center text-[10px] font-bold text-on-surface-variant uppercase">{t.damageType}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {countryStats.map(c => (
                  <tr key={c.country} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-md px-md font-bold text-on-surface">{c.country}</td>
                    {typeStats.map(t => {
                      const val = countryTypeStats.find(ct => ct.country === c.country && ct.type === t.damageType)?.count || 0;
                      const opacity = Math.min(1, val / 500); // 500건 이상이면 최대 진함
                      return (
                        <td key={t.damageType} className="py-md px-md text-center">
                          <div 
                            className="inline-flex items-center justify-center min-w-[50px] px-2 py-1 rounded font-mono text-[11px] transition-all"
                            style={{
                              backgroundColor: `rgba(0, 88, 190, ${opacity * 0.8})`,
                              color: opacity > 0.5 ? 'white' : 'inherit',
                              border: val > 0 ? '1px solid rgba(0, 88, 190, 0.1)' : '1px dashed #E2E8F0'
                            }}
                          >
                            {val.toLocaleString()}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
