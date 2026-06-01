import React, { useState } from 'react';

interface RoadDamage {
  id: number;
  damageType: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

interface AdminDataProps {
  damages: RoadDamage[];
  onAddDamage: (damage: Omit<RoadDamage, 'id' | 'capturedAt'>) => void;
  onDeleteDamage: (id: number) => void;
}

export const AdminData: React.FC<AdminDataProps> = ({
  damages,
  onAddDamage,
  onDeleteDamage,
}) => {
  const [damageType, setDamageType] = useState('D00');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('올바른 좌표를 입력하세요.');
      return;
    }

    onAddDamage({
      damageType,
      latitude: latNum,
      longitude: lngNum,
    });

    setSuccessMsg('신규 도로 손상 정보가 성공적으로 등록되었습니다.');
    setLatitude('');
    setLongitude('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };


  return (
    <div className="p-lg space-y-lg">
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">도로 데이터 관리</h2>
        <p className="text-on-surface-variant text-sm">유지보수 대상 도로 손상 정보의 직권 등록 및 제어 메뉴입니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Registration Form */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm space-y-md">
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
                placeholder="예: 37.556"
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
                placeholder="예: 126.906"
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
          <div className="p-lg border-b border-outline-variant bg-surface-container-low/20">
            <h3 className="font-headline text-md font-bold text-on-surface">등록 데이터 삭제 및 제어</h3>
          </div>
          <div className="overflow-y-auto max-h-[460px] flex-grow">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold sticky top-0 border-b border-outline-variant">
                <tr>
                  <th className="px-md py-sm">ID</th>
                  <th className="px-md py-sm">유형</th>
                  <th className="px-md py-sm">위도</th>
                  <th className="px-md py-sm">경도</th>
                  <th className="px-md py-sm">제어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {damages.map((d) => (
                  <tr key={d.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-md py-xs font-mono text-[11px] text-primary">#{d.id}</td>
                    <td className="px-md py-xs text-[11px]">
                      <span className="font-semibold text-on-surface-variant">{d.damageType}</span>
                    </td>
                    <td className="px-md py-xs font-mono text-[11px] text-on-surface">{d.latitude.toFixed(4)}</td>
                    <td className="px-md py-xs font-mono text-[11px] text-on-surface">{d.longitude.toFixed(4)}</td>
                    <td className="px-md py-xs">
                      <button
                        onClick={() => {
                          if (confirm(`손상 정보 #${d.id}번을 정말 삭제하시겠습니까?`)) {
                            onDeleteDamage(d.id);
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
        </div>
      </div>
    </div>
  );
};
