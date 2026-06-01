import React, { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

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

  // 구글 맵 로더 설정
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const defaultDamages: RoadDamage[] = [
    { id: 101, damageType: 'D40', latitude: 37.5730, longitude: 126.9790, capturedAt: new Date().toISOString() },
    { id: 102, damageType: 'D20', latitude: 37.5030, longitude: 127.0440, capturedAt: new Date().toISOString() },
    { id: 103, damageType: 'D00', latitude: 37.5560, longitude: 126.9060, capturedAt: new Date().toISOString() },
    { id: 104, damageType: 'D10', latitude: 37.5250, longitude: 126.9240, capturedAt: new Date().toISOString() },
    { id: 105, damageType: 'D20', latitude: 37.5410, longitude: 127.0560, capturedAt: new Date().toISOString() },
  ];

  const currentDamages = propDamages.length > 0 ? propDamages : defaultDamages;

  // 필터 처리
  const filteredDamages = currentDamages.filter(
    (d) => filterType === 'ALL' || d.damageType === filterType
  );

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

  // 지도 중심 위치 (서울 중심)
  const center = useMemo(() => ({ lat: 37.53, lng: 126.98 }), []);
  
  // 구글 맵 다크 모드 스타일
  const mapOptions = {
    disableDefaultUI: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ],
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
      <div className="flex-grow bg-slate-900 relative">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={12}
            options={mapOptions}
            onClick={() => setSelectedDamage(null)}
          >
            {filteredDamages.map((damage) => (
              <Marker
                key={damage.id}
                position={{ lat: damage.latitude, lng: damage.longitude }}
                onClick={() => setSelectedDamage(damage)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: severityColors[damage.damageType]?.pin || '#545f73',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                  scale: 8,
                }}
              />
            ))}
            
            {/* 팝업 정보창 (InfoWindow) */}
            {selectedDamage && (
              <InfoWindow
                position={{ lat: selectedDamage.latitude, lng: selectedDamage.longitude }}
                onCloseClick={() => setSelectedDamage(null)}
              >
                <div className="p-1 text-slate-900">
                  <p className="font-bold text-sm mb-1">{typeMap[selectedDamage.damageType] || selectedDamage.damageType}</p>
                  <p className="text-xs">ID: #{selectedDamage.id}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
};
