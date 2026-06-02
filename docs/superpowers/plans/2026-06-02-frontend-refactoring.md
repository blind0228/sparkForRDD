# RDD2024 프론트엔드 리팩토링 구현 계획 (RDD2024 Frontend Refactoring Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 백엔드의 마커-라벨 이원화 API 구조에 맞춰 프론트엔드 타입을 리팩토링하고, 상세 보기 모달(바운딩 박스 포함)을 구현합니다.

**Architecture:** 공통 타입 시스템 구축, 대시보드 통계 연동 수정, 지도 마커 기반 상세 조회 로직 구현.

**Tech Stack:** React, TypeScript, Tailwind CSS, Google Maps API, Recharts.

---

### Task 1: 타입 시스템 리팩토링 (Types Refactoring)

**Files:**
- Create: `frontend/src/types/damage.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/pages/MapMode.tsx`

- [ ] **Step 1: 공통 타입 정의 파일 생성**

```typescript
// frontend/src/types/damage.ts
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
```

- [ ] **Step 2: App.tsx 상태 타입 수정**

```typescript
// frontend/src/App.tsx 수정 (부분)
import { RoadDamageMarker } from './types/damage';
// ...
const [markers, setMarkers] = useState<RoadDamageMarker[]>([]);
// API 호출 경로 수정: /api/damages -> /api/damages/markers
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/types/damage.ts frontend/src/App.tsx
git commit -m "refactor: define new data models and update global state"
```

---

### Task 2: 대시보드 통계 및 리스트 리팩토링

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: 통계 API 연동 및 데이터 매핑 수정**

```typescript
// Dashboard.tsx 수정
// stats API: /api/damages/stats -> /api/damages/stats/types
// response item 필드: item.damageType -> item.damageName (라벨로 사용)
```

- [ ] **Step 2: 최근 기록 섹션 수정**

```typescript
// RoadDamage -> RoadDamageMarker 타입으로 변경
// 리스트 항목 표시 시 fileName 및 country 활용
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "refactor: update dashboard to use new stats API and marker model"
```

---

### Task 3: 지도 마커 및 상세 조회 로직 구현

**Files:**
- Modify: `frontend/src/pages/MapMode.tsx`
- Create: `frontend/src/components/DamageDetailModal.tsx`

- [ ] **Step 1: MapMode 마커 로직 수정**

```typescript
// MapMode.tsx 수정
// /api/damages/map -> /api/damages/markers 호출
// 마커 클릭 시 fileName을 추출하여 상세 모달 상태 제어
```

- [ ] **Step 2: 상세 정보 모달(DamageDetailModal) 구현**

```typescript
// DamageDetailModal.tsx (신규)
// props: isOpen, marker, onClose
// 내부에서 /api/damages/labels/file/{fileName} 호출
// 이미지 위에 바운딩 박스 오버레이 그리기 (상대 좌표 계산)
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/pages/MapMode.tsx frontend/src/components/DamageDetailModal.tsx
git commit -m "feat: implement map marker updates and detail modal with bounding boxes"
```

---

### Task 4: 최종 UI 정리 및 가상 데이터 안내 추가

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/pages/MapMode.tsx`

- [ ] **Step 1: 가상 데이터 안내 문구 추가**

```html
<p className="text-[10px] text-outline mt-2 italic">
  * 본 위치 정보는 시각화를 위한 가상 데이터이며 실제 촬영 위치와 다를 수 있습니다.
</p>
```

- [ ] **Step 2: 이미지 경로 보정**

```typescript
// imageUrl이 없을 경우 /images/${imageFileName}을 기본값으로 사용하도록 보정
```

- [ ] **Step 3: 최종 빌드 확인 및 Commit**
```bash
npm run build --prefix frontend
git add frontend/src/
git commit -m "style: add virtual data notices and final UI polish"
```
