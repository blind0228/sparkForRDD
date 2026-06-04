import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
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
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);
  const [searchParams] = useSearchParams();
  
  // 구글 맵 로더 설정
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Deck.gl 오버레이 초기화 및 업데이트
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    if (!overlayRef.current) {
      overlayRef.current = new GoogleMapsOverlay({});
      overlayRef.current.setMap(mapRef.current);
    }

    const layers = [];

    // 줌 레벨이 낮을 때 Deck.gl 히트맵 레이어 추가
    if (zoom < 10 && clusters.length > 0) {
      layers.push(
        new HeatmapLayer({
          id: 'heatmap-layer',
          data: clusters,
          getPosition: (d: any) => [d.longitude, d.latitude],
          getWeight: (d: any) => d.count,
          radiusPixels: 50, // 개별 점의 크기는 줄임
          intensity: 4,    // 중첩 시 색상이 붉게 변하는 강도 대폭 강화
          threshold: 0.01,  // 아주 미세한 데이터도 시각화
          colorRange: [
            [0, 88, 190],   // 파랑 (저밀도)
            [0, 196, 159],  // 청록
            [255, 187, 40], // 노랑
            [230, 81, 0],   // 주황
            [183, 28, 28]   // 빨강 (고밀도)
          ]
        }) as any
      );
    }

    overlayRef.current.setProps({ layers });

    return () => {
      // 컴포넌트 언마운트 시 오버레이 처리
    };
  }, [isLoaded, zoom, clusters]);

  // 지도 영역 변경 시 데이터 페칭
  const handleIdle = async () => {
    if (!mapRef.current) return;

    const currentZoom = mapRef.current.getZoom() || 12;
    setZoom(currentZoom);

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // 전 세계를 볼 때 위경도 범위를 안전한 값으로 캡핑
    const currentMinLat = Math.max(-85, sw.lat());
    const currentMaxLat = Math.min(85, ne.lat());
    const currentMinLng = sw.lng() < ne.lng() ? sw.lng() : -180;
    const currentMaxLng = sw.lng() < ne.lng() ? ne.lng() : 180;
    
    const isWorldView = currentZoom < 5;
    const finalMinLng = isWorldView ? -180 : currentMinLng;
    const finalMaxLng = isWorldView ? 180 : currentMaxLng;
    const finalMinLat = isWorldView ? -85 : currentMinLat;
    const finalMaxLat = isWorldView ? 85 : currentMaxLat;

    try {
      if (currentZoom < 10) {
        // 줌 레벨이 낮을 때: 히트맵 데이터 밀도를 대폭 높임 (0.5~2.0 수준으로 세밀하게)
        let gridSize = 0.8;
        if (currentZoom >= 5) gridSize = 0.3; 

        const url = `/api/damages/clusters?minLat=${finalMinLat}&minLng=${finalMinLng}&maxLat=${finalMaxLat}&maxLng=${finalMaxLng}&gridSize=${gridSize}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setClusters(data);
            setMarkers([]);
          }
        }
      } else {
        // 줌 10 이상부터 개별 마커
        const url = `/api/damages/markers?minLat=${currentMinLat}&minLng=${currentMinLng}&maxLat=${currentMaxLat}&maxLng=${currentMaxLng}&limit=1000`;
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
                {(zoom < 10 
                  ? clusters.reduce((acc, c) => acc + c.count, 0) 
                  : markers.length).toLocaleString()} <span className="text-xs font-normal text-outline">건</span>
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
            mapContainerStyle={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }}
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
                  {zoom >= 10 && markers.map((marker) => (
                    <Marker
                      key={marker.id}
                      position={{ lat: marker.latitude, lng: marker.longitude }}
                      onClick={() => handleMarkerClick(marker)}
                      clusterer={clusterer}
                      icon={window.google && window.google.maps ? {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#0058be',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFFFFF',
                        scale: 8,
                      } : undefined}
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
