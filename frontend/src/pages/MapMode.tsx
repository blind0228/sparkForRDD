import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { useSearchParams } from 'react-router-dom';
import type { RoadDamageMarker } from '../types/damage';
import { DamageDetailModal } from '../components/DamageDetailModal';

interface MapModeProps {
}

export const MapMode: React.FC<MapModeProps> = () => {
  const [selectedMarker, setSelectedMarker] = useState<RoadDamageMarker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [markers, setMarkers] = useState<RoadDamageMarker[]>([]);
  const [clusters, setClusters] = useState<{latitude: number, longitude: number, count: number}[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 37.53, lng: 126.98 });
  const [zoom, setZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<google.maps.Map | null>(null);
  const [searchParams] = useSearchParams();
  
  // 구글 맵 로더 설정
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // 지도 영역 변경 시 데이터 페칭
  const handleIdle = async () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    const currentZoom = mapRef.current.getZoom() || 12;
    setZoom(currentZoom);

    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const minLat = sw.lat();
    const minLng = sw.lng();
    const maxLat = ne.lat();
    const maxLng = ne.lng();

    try {
      if (currentZoom < 16) {
        // 줌 레벨이 낮거나 중간일 때: 클러스터 요청
        // 그리드 크기를 훨씬 공격적으로 설정하여 더 넓은 범위로 합침
        // 줌 1일 때 약 40도, 줌 10일 때 약 0.08도 수준으로 조정
        const gridSize = Math.pow(2, 12 - currentZoom) * 0.1;
        const url = `/api/damages/clusters?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}&gridSize=${gridSize}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setClusters(data);
          setMarkers([]);
        }
      } else {
        // 아주 많이 확대했을 때만 개별 마커 (줌 16 이상)
        const url = `/api/damages/markers?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}&limit=1000`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMarkers(data);
          setClusters([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data in viewport:', error);
    }
  };

  // URL 파라미터로 넘어온 검색어가 있으면 자동 검색 실행
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && isLoaded && window.google) {
      setSearchQuery(q);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: q }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
        }
      });
    }
  }, [searchParams, isLoaded]);

  const handleSearch = () => {
    if (!searchQuery.trim() || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
      } else {
        alert('해당 위치를 찾을 수 없습니다.');
      }
    });
  };

  const handleMarkerClick = (marker: RoadDamageMarker) => {
    setSelectedMarker(marker);
    setIsModalOpen(true);
  };

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

          {/* Search Section */}
          <div className="space-y-sm">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">위치 검색</span>
            <div className="flex gap-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="예: 진주시, 강남구..."
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
              />
              <button
                onClick={handleSearch}
                className="px-md bg-primary text-on-primary rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </div>
          </div>

          {/* Statistics Summary inside Map Control */}
          <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant space-y-xs">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">지도 내 관측치</span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-on-surface-variant">발견된 손상 건수:</span>
              <span className="font-display text-lg font-bold text-on-surface">
                {zoom < 13 
                  ? clusters.reduce((acc, c) => acc + c.count, 0).toLocaleString() 
                  : markers.length.toLocaleString()} <span className="text-xs font-normal text-outline">건</span>
              </span>
            </div>
          </div>

          <p className="text-[10px] text-outline mt-2 italic">* 본 위치 정보는 시각화를 위한 가상 데이터이며 실제 촬영 위치와 다를 수 있습니다.</p>
        </div>

        {/* Selected Point Detail Panel */}
        {selectedMarker ? (
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline shadow-sm space-y-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary">
                  ID: #{selectedMarker.id}
                </span>
                <h4 className="font-bold text-xs text-on-surface mt-xs">
                  {selectedMarker.fileName}
                </h4>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="text-[11px] space-y-xs text-on-surface-variant">
              <p className="flex justify-between">
                <span>위도:</span>
                <span className="font-mono">{selectedMarker.latitude.toFixed(6)}</span>
              </p>
              <p className="flex justify-between">
                <span>경도:</span>
                <span className="font-mono">{selectedMarker.longitude.toFixed(6)}</span>
              </p>
              <p className="flex justify-between">
                <span>감지 시간:</span>
                <span>{new Date(selectedMarker.createdAt).toLocaleString('ko-KR')}</span>
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-sm py-xs bg-primary/10 text-primary text-[10px] font-bold rounded hover:bg-primary/20 transition-colors"
              >
                상세 보기
              </button>
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
            center={mapCenter}
            zoom={12}
            options={{
              ...mapOptions,
              minZoom: 0,
              maxZoom: 22,
            }}
            onClick={() => setSelectedMarker(null)}
            onLoad={(map) => { mapRef.current = map; }}
            onIdle={handleIdle}
          >
            <MarkerClusterer
              options={{
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
              }}
            >
              {(clusterer) => (
                <>
                  {/* 개별 마커 렌더링 (줌이 높을 때) */}
                  {markers.map((marker) => (
                    <Marker
                      key={marker.id}
                      position={{ lat: marker.latitude, lng: marker.longitude }}
                      onClick={() => handleMarkerClick(marker)}
                      clusterer={clusterer}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#0058be',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFFFFF',
                        scale: 8,
                      }}
                    />
                  ))}

                  {/* 서버 사이드 클러스터 마커 렌더링 (줌이 낮을 때) */}
                  {clusters.map((cluster, index) => (
                    <Marker
                      key={`cluster-${index}`}
                      position={{ lat: cluster.latitude, lng: cluster.longitude }}
                      label={{
                        text: cluster.count > 999999 
                          ? `${(cluster.count / 1000000).toFixed(1)}M` 
                          : cluster.count > 999 
                            ? `${(cluster.count / 1000).toFixed(1)}k` 
                            : cluster.count.toString(),
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: cluster.count > 10000 ? '#b71c1c' : cluster.count > 1000 ? '#e65100' : '#0058be',
                        fillOpacity: 0.9,
                        strokeWeight: 2,
                        strokeColor: '#FFFFFF',
                        scale: cluster.count > 1000 ? 30 : 22,
                      }}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
            
            {/* 팝업 정보창 (InfoWindow) */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 text-slate-900">
                  <p className="font-bold text-sm mb-1">{selectedMarker.fileName}</p>
                  <p className="text-xs">ID: #{selectedMarker.id}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      <DamageDetailModal 
        isOpen={isModalOpen}
        marker={selectedMarker}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
