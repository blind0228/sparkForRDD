import React, { useState, useEffect } from 'react';
import type { RoadDamageMarker } from '../types/damage';

interface DataListProps {
}

export const DataList: React.FC<DataListProps> = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = localSearchTerm;

  const [filterType, setFilterType] = useState('ALL');
  
  // 서버 사이드 페이징 상태
  const [damages, setDamages] = useState<RoadDamageMarker[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // 정렬용 더미 함수 (추후 서버 연동 필요)
  const handleSort = (field: string) => { console.log('Sorting by', field); };
  const getSortIcon = (_field: string) => 'unfold_more';

  useEffect(() => {
    const fetchDamages = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', (currentPage - 1).toString());
        queryParams.append('size', itemsPerPage.toString());
        
        if (filterType !== 'ALL') {
          queryParams.append('country', filterType); // 현재 백엔드는 country 필터만 지원하므로 매핑
        }

        const res = await fetch(`/api/damages?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDamages(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        }
      } catch (error) {
        console.error('API 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDamages();
  }, [currentPage, filterType, searchTerm]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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
            placeholder="ID, 국가, 좌표 검색..."
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
            <option value="ALL">모든 국가</option>
            <option value="Japan">Japan</option>
            <option value="India">India</option>
            <option value="China">China</option>
            <option value="Czech">Czech</option>
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
                <th className="px-lg py-md hover:bg-surface-container-high transition-colors select-none">
                  국가
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
                <th className="px-lg py-md hover:bg-surface-container-high transition-colors select-none">
                  손상 건수
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="px-lg py-md cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                >
                  <div className="flex items-center gap-xs">
                    기록 시간
                    <span className="material-symbols-outlined text-sm">{getSortIcon('createdAt')}</span>
                  </div>
                </th>
                <th className="px-lg py-md">동작</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-xs text-outline">
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : damages.length > 0 ? (
                damages.map((damage) => (
                  <tr key={damage.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-lg py-md font-mono text-xs font-semibold text-primary">#{damage.id}</td>
                    <td className="px-lg py-md">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-secondary-container text-on-secondary-container">
                        {damage.country}
                      </span>
                    </td>
                    <td className="px-lg py-md font-mono text-xs text-on-surface">{damage.latitude.toFixed(6)}</td>
                    <td className="px-lg py-md font-mono text-xs text-on-surface">{damage.longitude.toFixed(6)}</td>
                    <td className="px-lg py-md font-mono text-xs text-on-surface">{damage.totalDamageCount}건</td>
                    <td className="px-lg py-md text-xs text-on-surface-variant">
                      {new Date(damage.createdAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-lg py-md">
                      <button className="text-primary hover:underline text-xs font-bold">상세조회</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-xs text-outline">
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
              전체 {totalElements}개 중 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalElements)}개 표시
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
