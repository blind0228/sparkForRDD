import React, { useState, useEffect } from 'react';
import type { RoadDamageMarker } from '../types/damage';

interface AdminDataProps {
  onAddDamage: (damage: any) => void;
  onDeleteDamage: (id: number) => void;
}

export const AdminData: React.FC<AdminDataProps> = ({
  onAddDamage,
  onDeleteDamage,
}) => {
  const [damages, setDamages] = useState<RoadDamageMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [damageType, setDamageType] = useState('D00');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageX, setImageX] = useState('');
  const [imageY, setImageY] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 15;

  const fetchDamages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/damages?page=${currentPage - 1}&size=${itemsPerPage}`);
      if (res.ok) {
        const data = await res.json();
        setDamages(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDamages();
  }, [currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const imgXNum = parseFloat(imageX);
    const imgYNum = parseFloat(imageY);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(imgXNum) || isNaN(imgYNum)) {
      alert('올바른 좌표와 이미지 좌표를 입력하세요.');
      return;
    }

    onAddDamage({
      damageType,
      latitude: latNum,
      longitude: lngNum,
      imageX: imgXNum,
      imageY: imgYNum,
    });

    setSuccessMsg('신규 도로 손상 정보가 성공적으로 등록되었습니다.');
    setLatitude('');
    setLongitude('');
    setImageX('');
    setImageY('');
    
    // 리스트 새로고침
    setTimeout(() => {
      setSuccessMsg('');
      fetchDamages();
    }, 1500);
  };

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

  if (loading && damages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">도로 데이터 관리</h2>
        <p className="text-on-surface-variant text-sm">유지보수 대상 도로 손상 정보의 직권 등록 및 제어 메뉴입니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Registration Form */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm space-y-md h-fit">
          <h3 className="font-headline text-md font-bold text-on-surface">신규 도로 손상 직접 등록</h3>

          {successMsg && (
            <div className="p-sm bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-200 border border-green-200 rounded-lg text-xs font-semibold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">손상 유형 선택</label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              >
                <option value="D00">D00 (종방향 균열)</option>
                <option value="D10">D10 (횡방향 균열)</option>
                <option value="D20">D20 (포트홀)</option>
                <option value="D40">D40 (심각한 파손)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">위도 (Latitude)</label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="예: 37.5250"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">경도 (Longitude)</label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="예: 126.9240"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">이미지 파손 좌표 X</label>
              <input
                type="text"
                required
                value={imageX}
                onChange={(e) => setImageX(e.target.value)}
                placeholder="예: 320.5"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">이미지 파손 좌표 Y</label>
              <input
                type="text"
                required
                value={imageY}
                onChange={(e) => setImageY(e.target.value)}
                placeholder="예: 240.0"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add_location</span>
              손상 좌표 등록
            </button>
          </form>
        </div>

        {/* Existing Data Control Table (High Density) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="p-lg border-b border-outline-variant bg-surface-container-low/20 flex justify-between items-center">
            <h3 className="font-headline text-md font-bold text-on-surface">등록 데이터 삭제 및 제어</h3>
            <span className="text-[11px] text-outline font-medium">총 {totalElements.toLocaleString()}건</span>
          </div>
          <div className="overflow-y-auto max-h-[500px] flex-grow relative">
            {loading && (
              <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold sticky top-0 border-b border-outline-variant z-20">
                <tr>
                  <th className="px-md py-sm">ID</th>
                  <th className="px-md py-sm">국가</th>
                  <th className="px-md py-sm">위도</th>
                  <th className="px-md py-sm">경도</th>
                  <th className="px-md py-sm text-center">제어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {damages.map((d) => (
                  <tr key={d.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-md py-xs font-mono text-[11px] text-primary">#{d.id}</td>
                    <td className="px-md py-xs text-[11px]">
                      <span className="font-semibold text-on-surface-variant">{d.country}</span>
                    </td>
                    <td className="px-md py-xs font-mono text-[11px] text-on-surface">{d.latitude.toFixed(4)}</td>
                    <td className="px-md py-xs font-mono text-[11px] text-on-surface">{d.longitude.toFixed(4)}</td>
                    <td className="px-md py-xs text-center">
                      <button
                        onClick={() => {
                          if (confirm(`손상 정보 #${d.id}번을 정말 삭제하시겠습니까?`)) {
                            onDeleteDamage(d.id);
                            setDamages(prev => prev.filter(item => item.id !== d.id));
                          }
                        }}
                        className="text-error hover:underline text-[11px] font-bold"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-md border-t border-outline-variant flex justify-center bg-surface-container-low/10">
              <div className="flex gap-xs">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-7 h-7 border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {getPageNumbers().map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded text-[11px] font-bold border ${
                      currentPage === p ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-7 h-7 border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
