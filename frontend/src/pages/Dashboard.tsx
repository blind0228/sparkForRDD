import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RoadDamage {
  id: number;
  damageType: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

interface DamageStats {
  damageType: string;
  count: number;
}

interface DashboardProps {
  damages: RoadDamage[];
}

export const Dashboard: React.FC<DashboardProps> = ({ damages }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DamageStats[]>([]);
  const [loading, setLoading] = useState(true);

  // 대미지 타입 한국어 매핑
  const typeMap: Record<string, string> = {
    D00: '종방향 균열 (D00)',
    D10: '횡방향 균열 (D10)',
    D20: '포트홀 (D20)',
    D40: '심각한 파손 (D40)',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/damages/stats');

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('API 호출 중 오류가 발생했습니다. 모의 데이터를 로드합니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [damages]);

  // API 호출 실패 혹은 DB가 빌 경우를 위한 고품질 Mock Data 구성
  const defaultStats: DamageStats[] = [
    { damageType: 'D00', count: 428 },
    { damageType: 'D10', count: 215 },
    { damageType: 'D20', count: 562 },
    { damageType: 'D40', count: 43 },
  ];

  const defaultDamages: RoadDamage[] = [
    { id: 1, damageType: 'D40', latitude: 37.573, longitude: 126.979, capturedAt: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 2, damageType: 'D20', latitude: 37.503, longitude: 127.044, capturedAt: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: 3, damageType: 'D00', latitude: 37.556, longitude: 126.906, capturedAt: new Date(Date.now() - 120 * 60000).toISOString() },
  ];

  const currentStats = stats.length > 0 ? stats : defaultStats;
  const currentDamages = damages.length > 0 ? damages : defaultDamages;

  // 전체 건수 계산
  const totalDamages = currentStats.reduce((sum, item) => sum + item.count, 0);

  // 고위험 구역 계산 (D40)
  const highRiskCount = currentStats.find((item) => item.damageType === 'D40')?.count || 0;

  // 최다 발생 유형
  const mostFrequentType = [...currentStats].sort((a, b) => b.count - a.count)[0]?.damageType || 'D00';

  // 차트 렌더용 데이터 포맷
  const chartData = currentStats.map((item) => ({
    name: item.damageType,
    count: item.count,
    fullName: typeMap[item.damageType] || item.damageType,
  }));

  const COLORS = {
    D00: '#545f73', // secondary
    D10: '#2170e4', // primary-container
    D20: '#0058be', // primary
    D40: '#ba1a1a', // error
  };

  // 시간 표시용 포맷터
  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)}분 전`;
    }
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }
    return new Date(isoString).toLocaleDateString('ko-KR');
  };

  // 모의 유지보수 일정 테이블용
  const mockSchedule = [
    { id: '#RP-9821', location: '서울시 강남구 논현동 102-1', type: 'D20', priority: '긴급', assign: '박현우 과장', status: '승인 대기' },
    { id: '#RP-9819', location: '서울시 서초구 방배로 45', type: 'D00', priority: '보통', assign: '이민정 대리', status: '작업 중' },
    { id: '#RP-9788', location: '서울시 영등포구 국제금융로 10', type: 'D40', priority: '최우선', assign: '정승호 선임', status: '현장 조사' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">시스템 개요</h2>
          <p className="text-on-surface-variant text-sm">실시간 도로 피해 상황 및 관리 지표입니다.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-bold text-xs text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            최근 30일
          </button>
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-bold text-xs text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">download</span>
            보고서 다운로드
          </button>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
        {/* Total Damages Card */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="text-success text-[11px] font-bold bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded-full">
              +12% 전월대비
            </span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold">전체 피해 발견 건수</p>
          <p className="font-display text-3xl font-bold text-on-surface mt-xs">
            {totalDamages.toLocaleString()}{' '}
            <span className="text-sm font-normal text-outline">건</span>
          </p>
        </div>

        {/* High Risk Card */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-error/10 text-error rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">error</span>
            </div>
            <span className="text-error text-[11px] font-bold bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
              긴급 {highRiskCount}건
            </span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold">고위험 지역 (D40)</p>
          <p className="font-display text-3xl font-bold text-on-surface mt-xs">
            {highRiskCount}{' '}
            <span className="text-sm font-normal text-outline">구역</span>
          </p>
        </div>

        {/* Frequent Type Card */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">grid_view</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold">최다 발생 유형</p>
          <p className="font-display text-2xl font-bold text-on-surface mt-xs">
            {mostFrequentType === 'D20' ? '포트홀' : mostFrequentType === 'D00' ? '종방향 균열' : '균열/기타'}{' '}
            <span className="text-sm font-normal text-outline">({mostFrequentType})</span>
          </p>
        </div>

        {/* Live Map Preview (Hybrid Card) */}
        <div
          onClick={() => navigate('/map')}
          className="md:col-span-1 lg:col-span-1 relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-highest min-h-[140px] cursor-pointer group"
        >
          <img
            alt="관제 현황 미니 맵"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFQmXupVrvbiyVKMhsyWrvizUzI8IM90V29xF3tzetaNFYNEaJepX2-BsCwYaNBmg87HrVs-RRoCvlErzyWrSxpwObqtElvwISCfqWu0s0tyS8TsZPIUsiT-hyfv026EyaKM79CiW8dFUOGpVZtqVMXx4W7GZZk9XHMDN1t6uDaB9SPF4Rgaq45jMRy_jYMoKDv9xN2Gt7c3m-SwUN9AHD3mqyTvGZrESxKQsgl7BSxs5BwmFd_Jarkuz6rbq1V9-AZg7RdUXKLGw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-md">
            <p className="text-white font-bold text-xs">관제 현황</p>
            <p className="text-white/80 text-[11px] flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              실시간 GPS 추적 중
            </p>
          </div>
        </div>
      </div>

      {/* Statistics & Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Statistics Chart Section */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline text-lg font-bold text-on-surface">피해 유형별 분포 (D00-D40)</h3>
            <div className="flex items-center gap-md">
              <div className="flex items-center gap-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="text-[11px] text-on-surface-variant font-medium">주요 손상</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                <span className="text-[11px] text-on-surface-variant font-medium">긴급 보수</span>
              </div>
            </div>
          </div>
          
          {/* Recharts BarChart */}
          <div className="h-[260px] w-full pt-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#424754', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#424754', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 88, 190, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface-container-lowest p-sm border border-outline-variant rounded-lg shadow-md text-xs">
                          <p className="font-bold text-on-surface">{data.fullName}</p>
                          <p className="text-primary font-bold mt-1">발견 건수: {data.count}건</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#0058be'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Records Section */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline text-lg font-bold text-on-surface">최근 보고 기록</h3>
            <button onClick={() => navigate('/damages')} className="text-primary font-bold text-xs hover:underline">
              전체보기
            </button>
          </div>
          <div className="space-y-sm flex-grow">
            {currentDamages.slice(0, 3).map((damage) => (
              <div
                key={damage.id}
                onClick={() => navigate('/damages')}
                className="flex items-center gap-md p-md rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant cursor-pointer group"
              >
                <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden flex-shrink-0">
                  <img
                    alt="도로 피해 이미지"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    src={
                      damage.damageType === 'D40'
                        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5hxxHDoL0x8RW8qGMEbJv3NmTwaNNmJf09Tcrk_aBdTq36A4EV7w4glprnw8C7w1me0Ha5GXwmJiz82KzdhvShJ4qb9dFWodKLwOpAZdhD9rO19nCVibMChTWCxiuzyB6C2RVdsZf_AnoLiUXKiV8NzcYJMaiS4PCWqjjTsT8NI0tex6Lx3A2VUEB7VB5NuvAbBORp8jj4PlECMjHiSQANaN7nFyIFlcL1TK_eoHkawWNGNixNBq2aniSznuitdFfUlxofXErgCs'
                        : damage.damageType === 'D20'
                        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Nv0uM6W2T2IhucAZ0SUVyBxdtY-uUPx3bYobGIRfDHLrcviMcaXQ9rQQc2-VVdt77JuyedbQc7Hc66QUtBp9PI-O7vKG_xWQaJ1DywDTwDgKuVdyvgG5F2zGsb9bVDJ61Yt_rMYy-BKqQRsbp3BvoSOLDpKAYL5VSqu3mg9AxL3tvVVAE9V3X3d7dLSSk8stwHEf6MwmmVCKCPN9VGhtEdqJYTlKoFvDpyCsXmLiIrcouEYCzS2Wc3MLvKum4TgbiJsWCXhZg0A'
                        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrqVXkiM1ElZNV_jRWJWfKh0dT9OH_7ucO4t8RGqMS_5X6lOJYyoEhH0jG_E15cOlZgcLHLSM7zxOPjEKsULw15Dj18A3CAm1G6R1OdtUodNvy7bY6M7SgjXWiP7nU08WuYdT-h7BaFHRgtvospKi2gM9snJZ62d7j7UB7ynp_Hfw6XiptJ23TpxokRO4zMuW6yneAyUcjj4Qfl3b624QZp1fU8Ja1ZesryquscenTapq5pCeTxZBcNBhLyiYDfiThtlfCEfB1l8'
                    }
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-xs text-on-surface">
                    위치: {damage.latitude.toFixed(4)}, {damage.longitude.toFixed(4)}
                  </p>
                  <div className="flex items-center gap-xs mt-0.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        damage.damageType === 'D40'
                          ? 'bg-error/10 text-error'
                          : damage.damageType === 'D20'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {damage.damageType}
                    </span>
                    <span className="text-[10px] text-outline">{formatTimeAgo(damage.capturedAt)}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Schedule Section (High Density Table) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
          <h3 className="font-headline text-lg font-bold text-on-surface">금주 유지보수 일정</h3>
          <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold">
              <tr>
                <th className="px-lg py-sm">ID</th>
                <th className="px-lg py-sm">위치</th>
                <th className="px-lg py-sm">피해 유형</th>
                <th className="px-lg py-sm">우선순위</th>
                <th className="px-lg py-sm">담당자</th>
                <th className="px-lg py-sm">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {mockSchedule.map((row) => (
                <tr key={row.id} className="hover:bg-primary-container/5 transition-colors">
                  <td className="px-lg py-md font-mono text-xs font-medium text-primary">{row.id}</td>
                  <td className="px-lg py-md text-xs text-on-surface">{row.location}</td>
                  <td className="px-lg py-md">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        row.type === 'D40'
                          ? 'bg-error/10 text-error'
                          : row.type === 'D20'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {typeMap[row.type] || row.type}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span
                      className={`text-xs font-bold flex items-center gap-xs ${
                        row.priority === '최우선' || row.priority === '긴급' ? 'text-error' : 'text-on-surface-variant'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          row.priority === '최우선' || row.priority === '긴급' ? 'bg-error' : 'bg-outline'
                        }`}
                      ></span>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-lg py-md text-xs text-on-surface-variant">{row.assign}</td>
                  <td className="px-lg py-md">
                    <span
                      className={`text-xs font-bold border px-2 py-0.5 rounded ${
                        row.status === '작업 중'
                          ? 'border-primary text-primary'
                          : row.status === '현장 조사'
                          ? 'border-green-600 text-green-600'
                          : 'border-secondary text-secondary'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
