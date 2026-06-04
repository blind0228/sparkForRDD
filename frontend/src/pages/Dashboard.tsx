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

import type { RoadDamageMarker, DamageStats } from '../types/damage';

interface CountryStats {
  country: string;
  count: number;
}

interface DashboardProps {
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DamageStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [recentMarkers, setRecentMarkers] = useState<RoadDamageMarker[]>([]);
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
        const [statsRes, countryStatsRes, recentRes] = await Promise.all([
          fetch('/api/damages/stats/types'),
          fetch('/api/damages/stats/countries'),
          fetch('/api/damages/markers?limit=10')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (countryStatsRes.ok) {
          const countryData = await countryStatsRes.json();
          setCountryStats(countryData);
        }
        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentMarkers(recentData);
        }
      } catch (error) {
        console.error('API 호출 중 오류가 발생했습니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 전체 건수 계산
  const totalDamages = stats.reduce((sum, item) => sum + item.count, 0);

  // 건수 포맷터 (1k 단위)
  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
  };

  // 고위험 국가 계산 (피해가 가장 많은 국가)
  const highRiskCountry = countryStats.length > 0 ? countryStats[0] : null;

  // 최다 발생 유형
  const mostFrequentType = stats.length > 0 
    ? [...stats].sort((a, b) => b.count - a.count)[0]?.damageType 
    : '-';

  // 차트 렌더용 데이터 포맷
  const chartData = stats.map((item) => ({
    name: item.damageType,
    count: item.count,
    fullName: item.damageName || typeMap[item.damageType] || item.damageType,
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
            <span className="text-primary text-[11px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">
              신규 감지 (24h)
            </span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold">전체 피해 발견 건수</p>
          <p className="font-display text-3xl font-bold text-on-surface mt-xs" title={totalDamages.toLocaleString() + " 건"}>
            {formatCount(totalDamages)}{' '}
            <span className="text-sm font-normal text-outline">건</span>
          </p>
        </div>

        {/* High Risk Card */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-error/10 text-error rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">public</span>
            </div>
            {highRiskCountry && (
              <span className="text-error text-[11px] font-bold bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                밀집도 주의
              </span>
            )}
          </div>
          <p className="text-on-surface-variant text-xs font-bold">집중 관리 국가 (최다 발생)</p>
          <p className="font-display text-2xl font-bold text-on-surface mt-xs">
            {highRiskCountry ? highRiskCountry.country : '-'}{' '}
            <span className="text-sm font-normal text-outline">({highRiskCountry ? highRiskCountry.count : 0}건)</span>
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

      <p className="text-[10px] text-outline mt-2 italic">* 본 위치 정보는 시각화를 위한 가상 데이터이며 실제 촬영 위치와 다를 수 있습니다.</p>

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
            {recentMarkers.length > 0 ? (
              recentMarkers.slice(0, 3).map((damage) => (
                <div
                  key={damage.id}
                  onClick={() => navigate('/damages')}
                  className="flex items-center gap-md p-md rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden flex-shrink-0">
                    <img
                      alt="도로 피해 이미지"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      src={damage.imageUrl || `/images/${damage.imageFileName}`}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-xs text-on-surface">
                      위치: {damage.latitude.toFixed(4)}, {damage.longitude.toFixed(4)}
                    </p>
                    <div className="flex items-center gap-xs mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-secondary-container text-on-secondary-container">
                        {damage.country}
                      </span>
                      <span className="text-[10px] text-outline">{formatTimeAgo(damage.createdAt)}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-outline p-lg">
                <span className="material-symbols-outlined text-4xl mb-xs opacity-50">data_alert</span>
                <p className="text-xs font-semibold">최근 보고된 기록이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Schedule Section (High Density Table) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
          <h3 className="font-headline text-lg font-bold text-on-surface">최근 등록된 손상 상세 (유지보수 대기)</h3>
          <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold">
              <tr>
                <th className="px-lg py-sm">ID</th>
                <th className="px-lg py-sm">위치 (위/경도)</th>
                <th className="px-lg py-sm">국가</th>
                <th className="px-lg py-sm">피해 건수</th>
                <th className="px-lg py-sm">발견 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentMarkers.length > 0 ? (
                recentMarkers.slice(0, 5).map((row) => (
                  <tr key={row.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-lg py-md font-mono text-xs font-medium text-primary">#{row.id}</td>
                    <td className="px-lg py-md text-xs text-on-surface">{row.latitude.toFixed(5)}, {row.longitude.toFixed(5)}</td>
                    <td className="px-lg py-md text-xs text-on-surface">{row.country}</td>
                    <td className="px-lg py-md text-xs text-on-surface">{row.totalDamageCount}건</td>
                    <td className="px-lg py-md text-xs text-on-surface-variant">{new Date(row.createdAt).toLocaleString('ko-KR')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-lg py-xl text-center text-xs text-outline">
                    유지보수 대기 중인 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
