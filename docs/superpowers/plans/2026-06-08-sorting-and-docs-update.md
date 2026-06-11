# Admin Data Sorting and Documentation Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 'Admin Data' (피해 데이터) 탭의 테이블 컬럼(ID, 위도, 경도 등)에 정렬 기능을 추가하고, 최근 변경 사항(GeoTools 연동, 로컬 이미지 서빙 등)을 포함하여 프로젝트 문서를 최신화합니다.

**Architecture:** 
1. 프론트엔드(`AdminData.tsx`)에서 정렬 상태(컬럼, 방향)를 관리하고 API 호출 시 정렬 파라미터를 전송합니다.
2. 백엔드(`RoadDamageController.java`)의 페이징 API는 이미 Spring Data JPA의 `Pageable`을 통해 정렬을 지원하므로, 프론트엔드의 요청에 맞춰 동작합니다.
3. `/docs` 및 루트 `.md` 파일들을 분석하여 최신 아키텍처와 구현 세부 사항을 반영합니다.

**Tech Stack:** React (TypeScript), Spring Boot (JPA Pageable), Markdown.

---

### Task 1: 'Admin Data' 탭 테이블 정렬 기능 구현

**Files:**
- Modify: `frontend/src/pages/AdminData.tsx`

- [ ] **Step 1: 정렬 상태 변수 추가 및 Fetch 로직 수정**

```typescript
// AdminData.tsx 내부
const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
  key: 'id',
  direction: 'desc',
});

const fetchDamages = async () => {
  setLoading(true);
  try {
    const sortParam = `${sortConfig.key},${sortConfig.direction}`;
    const res = await fetch(`/api/damages?page=${currentPage - 1}&size=${itemsPerPage}&sort=${sortParam}`);
    // ... 기존 처리
  }
  // ...
};
```

- [ ] **Step 2: 정렬 핸들러 함수 구현**

```typescript
const handleSort = (key: string) => {
  let direction: 'asc' | 'desc' = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });
  setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
};
```

- [ ] **Step 3: 테이블 헤더에 정렬 UI 적용**

```tsx
<thead className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold sticky top-0 border-b border-outline-variant z-20">
  <tr>
    <th className="px-md py-sm cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => handleSort('id')}>
      ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th className="px-md py-sm cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => handleSort('country')}>
      국가 {sortConfig.key === 'country' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th className="px-md py-sm cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => handleSort('latitude')}>
      위도 {sortConfig.key === 'latitude' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th className="px-md py-sm cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => handleSort('longitude')}>
      경도 {sortConfig.key === 'longitude' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th className="px-md py-sm text-center">제어</th>
  </tr>
</thead>
```

- [ ] **Step 4: useEffect 의존성 추가**

```typescript
useEffect(() => {
  fetchDamages();
}, [currentPage, sortConfig]);
```

- [ ] **Step 5: 정렬 기능 수동 테스트**
프론트엔드 실행 후 '피해 데이터' 탭에서 각 헤더를 클릭하여 데이터가 정렬되는지 확인.

---

### Task 2: 프로젝트 문서 최신화

**Files:**
- Modify: `README.md`
- Modify: `DESIGN.md`
- Modify: `SPARK_INTEGRATION_GUIDE.md`
- Modify: `docs/api-spec.md`

- [ ] **Step 1: README.md 및 DESIGN.md 업데이트**
GeoTools를 이용한 육지 필터링, 로컬 이미지 서빙 아키텍처, 공간 인덱스(STRtree) 사용 등의 내용을 추가.

- [ ] **Step 2: SPARK_INTEGRATION_GUIDE.md 업데이트**
BBox 좌표계(xCenter, yCenter) 명칭 및 0~1 정규화 좌표 관련 주의 사항 업데이트.

- [ ] **Step 3: docs/api-spec.md 업데이트**
새로 추가된 `/api/damages/spatial-status` 및 정렬 파라미터 관련 설명 추가.

---

### Task 4: 최종 변경 사항 커밋

- [ ] **Step 1: 변경 사항 확인 및 커밋**

Run: `git status && git diff`
Review: 모든 변경 사항이 의도대로 반영되었는지 확인.

Run:
```bash
git add .
git commit -m "feat: add sorting to admin data table and update documentation"
```
