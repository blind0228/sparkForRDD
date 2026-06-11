import React, { useState } from 'react';

interface RoadDamage {
  id: number;
  damageType: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

interface MapModeProps {
  damages: RoadDamage[];
}

export const MapMode: React.FC<MapModeProps> = ({ damages: propDamages }) => {
  const [selectedDamage, setSelectedDamage] = useState<RoadDamage | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const defaultDamages: RoadDamage[] = [
    { id: 101, damageType: 'D40', latitude: 37.5730, longitude: 126.9790, capturedAt: new Date().toISOString() }, // 종로
    { id: 102, damageType: 'D20', latitude: 37.5030, longitude: 127.0440, capturedAt: new Date().toISOString() }, // 강남
    { id: 103, damageType: 'D00', latitude: 37.5560, longitude: 126.9060, capturedAt: new Date().toISOString() }, // 마포
    { id: 104, damageType: 'D10', latitude: 37.5250, longitude: 126.9240, capturedAt: new Date().toISOString() }, // 여의도
    { id: 105, damageType: 'D20', latitude: 37.5410, longitude: 127.0560, capturedAt: new Date().toISOString() }, // 성수
  ];

  const currentDamages = propDamages.length > 0 ? propDamages : defaultDamages;

  // 필터 처리
  const filteredDamages = currentDamages.filter(
    (d) => filterType === 'ALL' || d.damageType === filterType
  );

  // 미려한 GIS 시뮬레이션을 위한 좌표 변환 (서울 범위 기준: 위도 37.48~37.59, 경도 126.88~127.08)
  const mapBounds = {
    minLat: 37.48,
    maxLat: 37.59,
    minLng: 126.88,
    maxLng: 127.08,
  };

  const getRelativeCoords = (lat: number, lng: number) => {
    // 경계값에 맞춰 SVG의 퍼센트 좌표로 환산
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = 100 - ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100; // y축 반전
    
    // 범위를 초과하는 경우 맵 안에 갇히도록 보정
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  const severityColors: Record<string, { bg: string; border: string; text: string; pin: string }> = {
    D00: { bg: 'bg-secondary-container', border: 'border-secondary', text: 'text-on-secondary-container', pin: '#545f73' },
    D10: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', pin: '#2170e4' },
    D20: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', pin: '#0058be' },
    D40: { bg: 'bg-error/10', border: 'border-error/20', text: 'text-error', pin: '#ba1a1a' },
  };

  const typeMap: Record<string, string> = {
    D00: '종방향 균열',
    D10: '횡방향 균열',
    D20: '포트홀',
    D40: '심각한 파손',
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex relative">
      {/* Sidebar Control Panel */}
      <div className="w-80 bg-surface border-r border-outline-variant p-lg flex flex-col justify-between z-10">
        <div className="space-y-lg">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface">GIS 관제 지도</h2>
            <p className="text-on-surface-variant text-xs mt-xs">도로 손상 지역의 실시간 GPS 좌표 맵입니다.</p>
          </div>

          {/* Filter Section */}
          <div className="space-y-sm">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">유형 필터</span>
            <div className="grid grid-cols-2 gap-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`py-sm px-md rounded-lg text-xs font-bold border transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                }`}
              >
                전체보기 ({currentDamages.length})
              </button>
              {Object.keys(severityColors).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`py-sm px-md rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-xs ${
                    filterType === type
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severityColors[type].pin }}
                  ></span>
                  {type} ({currentDamages.filter((d) => d.damageType === type).length})
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Summary inside Map Control */}
          <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant space-y-xs">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">지도 내 관측치</span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-on-surface-variant">선택된 손상 건수:</span>
              <span className="font-display text-lg font-bold text-on-surface">
                {filteredDamages.length} <span className="text-xs font-normal text-outline">건</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Point Detail Panel */}
        {selectedDamage ? (
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline shadow-sm space-y-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary">
                  ID: #{selectedDamage.id}
                </span>
                <h4 className="font-bold text-xs text-on-surface mt-xs">
                  {typeMap[selectedDamage.damageType] || selectedDamage.damageType}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDamage(null)}
                className="text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="text-[11px] space-y-xs text-on-surface-variant">
              <p className="flex justify-between">
                <span>위도:</span>
                <span className="font-mono">{selectedDamage.latitude.toFixed(6)}</span>
              </p>
              <p className="flex justify-between">
                <span>경도:</span>
                <span className="font-mono">{selectedDamage.longitude.toFixed(6)}</span>
              </p>
              <p className="flex justify-between">
                <span>감지 시간:</span>
                <span>{new Date(selectedDamage.capturedAt).toLocaleString('ko-KR')}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-md text-center bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant text-[11px] text-outline">
            지도의 마커를 클릭하면 상세 데이터가 표시됩니다.
          </div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="flex-grow bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        {/* Dark Styled Map Grid & Outline */}
        <div className="absolute inset-0 bg-slate-950 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

        {/* GIS Simulation Map Background (Styled Dark Canvas SVG) */}
        <svg
          className="w-[90%] h-[90%] opacity-80"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Mock Roads */}
          <path d="M 10,10 L 90,90" stroke="#334155" strokeWidth="0.8" fill="none" />
          <path d="M 10,90 L 90,10" stroke="#334155" strokeWidth="0.8" fill="none" />
          <path d="M 50,0 L 50,100" stroke="#334155" strokeWidth="1.2" fill="none" />
          <path d="M 0,50 L 100,50" stroke="#334155" strokeWidth="1.2" fill="none" />
          <path d="M 20,30 C 40,30 60,70 80,70" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
          
          {/* Mock Districts (Seoul Han River Simulation) */}
          <path d="M 0,55 C 30,55 45,45 65,48 C 85,50 95,43 100,45 L 100,52 C 90,50 80,56 65,54 C 45,51 30,62 0,62 Z" fill="#0f172a" />
        </svg>

        {/* Dynamic Pins */}
        {filteredDamages.map((damage) => {
          const coords = getRelativeCoords(damage.latitude, damage.longitude);
          const colorSet = severityColors[damage.damageType] || severityColors.D00;
          const isSelected = selectedDamage?.id === damage.id;

          return (
            <div
              key={damage.id}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              onClick={() => setSelectedDamage(damage)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              {/* Outer pulsing ring for critical items */}
              {damage.damageType === 'D40' && (
                <span className="absolute -inset-2 rounded-full bg-error/30 animate-ping opacity-75"></span>
              )}
              {/* Pin body */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-md transition-all ${
                  isSelected ? 'scale-125 border-white ring-2 ring-primary' : 'hover:scale-110 border-slate-700'
                }`}
                style={{ backgroundColor: colorSet.pin }}
              >
                <span className="material-symbols-outlined text-[14px] text-white">
                  {damage.damageType === 'D40' ? 'error' : 'location_on'}
                </span>
              </div>

              {/* Hover Overlay Card (Level 2 Elevation) */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 p-sm rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                    #{damage.id}
                  </span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${colorSet.bg} ${colorSet.text}`}>
                    {damage.damageType}
                  </span>
                </div>
                <p className="text-white text-[10px] font-bold mt-1">
                  {typeMap[damage.damageType] || damage.damageType}
                </p>
                <p className="text-slate-400 text-[9px] mt-0.5">
                  좌표: {damage.latitude.toFixed(4)}, {damage.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Interactive Floating Compass/Controls */}
        <div className="absolute bottom-6 right-6 bg-slate-900/80 border border-slate-800 p-sm rounded-lg shadow-lg flex flex-col gap-xs z-10">
          <button className="w-8 h-8 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold active:scale-95 transition-all">
            +
          </button>
          <button className="w-8 h-8 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold active:scale-95 transition-all">
            -
          </button>
          <button className="w-8 h-8 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
