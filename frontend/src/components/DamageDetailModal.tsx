import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { RoadDamageMarker, RoadDamageLabel } from '../types/damage';

interface DamageDetailModalProps {
  isOpen: boolean;
  marker: RoadDamageMarker | null;
  onClose: () => void;
}

export const DamageDetailModal: React.FC<DamageDetailModalProps> = ({ isOpen, marker, onClose }) => {
  const [labels, setLabels] = useState<RoadDamageLabel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && marker) {
      const fetchLabels = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/damages/labels/file/${marker.fileName}`);
          if (res.ok) {
            const data = await res.json();
            setLabels(data);
          }
        } catch (error) {
          console.error('Failed to fetch labels:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLabels();
    }
  }, [isOpen, marker]);

  if (!isOpen || !marker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Image with Bounding Boxes */}
        <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
          <img 
            src={marker.imageUrl || `/images/${marker.imageFileName}`} 
            alt="Road Damage" 
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Bounding Boxes */}
          {!loading && labels.map((label) => (
            <div
              key={label.id}
              className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none"
              style={{
                left: `${(label.xCenter - label.bboxWidth / 2) * 100}%`,
                top: `${(label.yCenter - label.bboxHeight / 2) * 100}%`,
                width: `${label.bboxWidth * 100}%`,
                height: `${label.bboxHeight * 100}%`,
              }}
            >
              <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 font-bold rounded">
                {label.damageCode}
              </span>
            </div>
          ))}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-80 p-6 flex flex-col bg-surface border-l border-outline-variant overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">손상 상세 정보</h3>
              <p className="text-xs text-on-surface-variant mt-1">ID: #{marker.id}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1 hover:bg-surface-container-low rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">파일 정보</span>
              <p className="text-sm font-medium text-on-surface truncate" title={marker.fileName}>
                {marker.fileName}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">위치 정보</span>
              <div className="mt-1 space-y-1 text-xs text-on-surface-variant font-mono">
                <p>Lat: {marker.latitude.toFixed(6)}</p>
                <p>Lng: {marker.longitude.toFixed(6)}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">감지된 손상</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  {labels.length} 건
                </span>
              </div>
              
              <div className="space-y-2">
                {labels.length > 0 ? labels.map((label) => (
                  <div 
                    key={label.id}
                    className="p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                      <span className="text-red-500 font-bold text-xs">{label.damageCode}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{label.damageName}</p>
                      <p className="text-[10px] text-on-surface-variant">Class ID: {label.classId}</p>
                    </div>
                  </div>
                )) : !loading && (
                  <p className="text-center py-4 text-xs text-outline italic">감지된 데이터가 없습니다.</p>
                )}
              </div>
            </div>

            <p className="text-[10px] text-outline mt-6 italic">* 본 위치 정보는 시각화를 위한 가상 데이터이며 실제 촬영 위치와 다를 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
