import React, { useState } from 'react';

interface RoadDamage {
  id: number;
  damageType: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

interface DataListProps {
  damages: RoadDamage[];
  searchQuery: string;
}

export const DataList: React.FC<DataListProps> = ({ damages: propDamages, searchQuery }) => {
  // 로컬 검색 상태는 searchQuery prop에 우선순위를 둡니다.
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = localSearchTerm || searchQuery;

  const [filterType, setFilterType] = useState('ALL');
  const [sortField, setSortField] = useState<keyof RoadDamage>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 대미지 타입 한국어 매핑
  const typeMap: Record<string, string> = {
    D00: '종방향 균열 (D00)',
    D10: '횡방향 균열 (D10)',
    D20: '포트홀 (D20)',
    D40: '심각한 파손 (D40)',
  };

  const defaultDamages: RoadDamage[] = [
    { id: 1, damageType: 'D40', latitude: 37.5730, longitude: 126.9790, capturedAt: '2026-06-01T15:30:00' },
    { id: 2, damageType: 'D20', latitude: 37.5030, longitude: 127.0440, capturedAt: '2026-06-01T14:45:00' },
    { id: 3, damageType: 'D00', latitude: 37.5560, longitude: 126.9060, capturedAt: '2026-06-01T13:20:00' },
    { id: 4, damageType: 'D10', latitude: 37.5250, longitude: 126.9240, capturedAt: '2026-06-01T12:05:00' },
    { id: 5, damageType: 'D20', latitude: 37.5410, longitude: 127.0560, capturedAt: '2026-06-01T11:15:00' },
    { id: 6, damageType: 'D00', latitude: 37.5665, longitude: 126.9780, capturedAt: '2026-06-01T10:00:00' },
    { id: 7, damageType: 'D40', latitude: 37.4979, longitude: 127.0276, capturedAt: '2026-06-01T09:12:00' },
    { id: 8, damageType: 'D20', latitude: 37.5112, longitude: 127.0596, capturedAt: '2026-06-01T08:05:00' },
    { id: 9, damageType: 'D00', latitude: 37.5684, longitude: 126.9816, capturedAt: '2026-05-31T23:50:00' },
    { id: 10, damageType: 'D10', latitude: 37.4812, longitude: 126.9525, capturedAt: '2026-05-31T22:30:00' },
    { id: 11, damageType: 'D20', latitude: 37.5340, longitude: 126.9940, capturedAt: '2026-05-31T20:15:00' },
  ];

  const currentDamages = propDamages.length > 0 ? propDamages : defaultDamages;

  // 검색/필터 필터링 로직
  const handleSort = (field: keyof RoadDamage) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredDamages = currentDamages
    .filter((d) => {
      const typeLabel = typeMap[d.damageType] || d.damageType;
      const matchesSearch =
        d.id.toString().includes(searchTerm) ||
        d.latitude.toString().includes(searchTerm) ||
        d.longitude.toString().includes(searchTerm) ||
        typeLabel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'ALL' || d.damageType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredDamages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDamages.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getSortIcon = (field: keyof RoadDamage) => {
    if (sortField !== field) return 'unfold_more';
    return sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  const badgeColors: Record<string, string> = {
    D00: 'bg-secondary-container text-on-secondary-container',
    D10: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    D20: 'bg-primary/10 text-primary',
    D40: 'bg-error/10 text-error',
  };

  return (
    <div className="p-lg space-y-lg">
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">도로 손상 데이터 목록</h2>
        <p className="text-on-surface-variant text-sm">시스템에 등록된 전체 손상 정보 리스트입니다.</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row gap-md justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setLocalSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ID, 유형, 좌표 검색..."
            className="w-full pl-9 pr-4 py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-sm w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-surface-container-lowest text-xs text-on-surface border border-outline-variant rounded-lg px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="ALL">모든 손상 유형</option>
            <option value="D00">D00 (종방향 균열)</option>
            <option value="D10">D10 (횡방향 균열)</option>
            <option value="D20">D20 (포트홀)</option>
            <option value="D40">D40 (심각한 파손)</option>
          </select>

          <button className="px-md py-sm bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 flex items-center gap-xs transition-all">
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Main Table (High Density Table) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold border-b border-outline-variant">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-lg py-md cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                >
                  <div className="flex items-center gap-xs">
                    ID
                    <span className="material-symbols-outlined text-sm">{getSortIcon('id')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('damageType')}
                  className="px-lg py-md cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                >
                  <div className="flex items-center gap-xs">
                    피해 유형
                    <span className="material-symbols-outlined text-sm">{getSortIcon('damageType')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('latitude')}
                  className="px-lg py-md cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                >
                  <div className="flex items-center gap-xs">
                    위도 (Latitude)
                    <span className="material-symbols-outlined text-sm">{getSortIcon('latitude')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('longitude')}
                  className="px-lg py-md cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                >
                  <div className="flex items-center gap-xs">
                    경도 (Longitude)
                    <span className="material-symbols-outlined text-sm">{getSortIcon('longitude')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('capturedAt')}
                  className="px-lg py-md cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                >
                  <div className="flex items-center gap-xs">
                    기록 시간
                    <span className="material-symbols-outlined text-sm">{getSortIcon('capturedAt')}</span>
                  </div>
                </th>
                <th className="px-lg py-md">동작</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {currentItems.length > 0 ? (
                currentItems.map((damage) => (
                  <tr key={damage.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-lg py-md font-mono text-xs font-semibold text-primary">#{damage.id}</td>
                    <td className="px-lg py-md">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          badgeColors[damage.damageType] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {typeMap[damage.damageType] || damage.damageType}
                      </span>
                    </td>
                    <td className="px-lg py-md font-mono text-xs text-on-surface">{damage.latitude.toFixed(6)}</td>
                    <td className="px-lg py-md font-mono text-xs text-on-surface">{damage.longitude.toFixed(6)}</td>
                    <td className="px-lg py-md text-xs text-on-surface-variant">
                      {new Date(damage.capturedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-lg py-md">
                      <button className="text-primary hover:underline text-xs font-bold">상세조회</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-xs text-outline">
                    일치하는 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-md border-t border-outline-variant flex justify-between items-center bg-surface-container-low/20">
            <span className="text-xs text-on-surface-variant">
              전체 {filteredDamages.length}개 중 {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDamages.length)}개 표시
            </span>
            <div className="flex gap-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1 border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-xs font-bold border transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1 border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
