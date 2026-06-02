export interface RoadDamageMarker {
  id: number;
  dataBatch: string;
  country: string;
  fileName: string;
  imageFileName: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  totalDamageCount: number;
  createdAt: string;
}

export interface RoadDamageLabel {
  id: number;
  damageCode: string;
  damageName: string;
  classId: number;
  xCenter: number;
  yCenter: number;
  bboxWidth: number;
  bboxHeight: number;
  latitude: number;
  longitude: number;
}

export interface DamageStats {
  damageType: string;
  damageName: string;
  count: number;
}
