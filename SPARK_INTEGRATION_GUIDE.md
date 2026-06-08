# Spark 데이터 연동 가이드 (Spark Integration Guide) - RDD2024 통합 버전

본 문서는 Apache Spark 환경에서 전처리 및 분석이 완료된 RDD2024 도로 손상 데이터셋을 통합 관리 시스템(Backend DB)으로 전송하기 위한 엔지니어용 가이드입니다.

본 시스템은 **마커(Marker) 기반 지도 시각화**와 **상세 라벨(Label) 조회**를 지원하기 위해 데이터를 두 개의 테이블로 분리하여 관리합니다.

---

## 1. 대상 데이터베이스 테이블 스펙

Spark DataFrame은 반드시 아래의 테이블 스키마(Schema)와 정확히 일치해야 정상적으로 적재됩니다.

### 1.1. 지도 마커용 테이블: `road_damage_markers`
이미지 1장(txt 파일 1개) 당 1개의 행으로 구성됩니다.

| 컬럼명 | 타입 (DB) | 설명 |
| :--- | :--- | :--- |
| `data_batch` | `VARCHAR` | 데이터 배치 구분 (예: `original`) |
| `country` | `VARCHAR` | 국가 정보 |
| `file_name` | `VARCHAR` | 원본 라벨 파일명 (PK 연동 키) |
| `image_file_name`| `VARCHAR` | 이미지 파일명 |
| `latitude` | `DOUBLE` | 가상 위도 |
| `longitude` | `DOUBLE` | 가상 경도 |
| `total_damage_count`| `INTEGER` | 이미지 내 포함된 총 손상 수 |
| `created_at` | `DATETIME` | 적재 시간 |

### 1.2. 상세 라벨용 테이블: `road_damage_labels`
YOLO 라벨 1줄 당 1개의 행으로 구성됩니다.

| 컬럼명 | 타입 (DB) | 설명 |
| :--- | :--- | :--- |
| `file_name` | `VARCHAR` | `road_damage_markers.file_name`과 연동되는 키 |
| `damage_code` | `VARCHAR` | 손상 코드 (예: `D00`, `D10`) |
| `damage_name` | `VARCHAR` | 손상 명칭 |
| `class_id` | `INTEGER` | YOLO 클래스 ID |
| `x_center`, `y_center` | `DOUBLE` | **BBox 중심 좌표 (0~1 상대값)** |
| `bbox_width`, `bbox_height`| `DOUBLE` | **BBox 크기 (0~1 상대값)** |
| `latitude`, `longitude` | `DOUBLE` | 마커와 동일한 위경도 |

> **주의**: 좌표값(`x_center`, `y_center`, `width`, `height`)은 반드시 이미지 픽셀 크기로 정규화된 **0.0 ~ 1.0 사이의 실수값**이어야 합니다. 픽셀 좌표(예: 320, 480)로 적재할 경우 지도 및 상세 모달에서 박스 위치가 어긋나게 됩니다.

---

## 2. JDBC Write 권장 옵션

*   `batchsize`: 최소 1,000 ~ 5,000 수준의 Batch 적용.
*   `mode`: 기존 데이터를 보존하기 위해 `"append"` 모드 사용.
*   `driver`: `org.postgresql.Driver` 사용.

---

## 3. 코드 작성 예시 (PySpark)

```python
# 1. 마커 데이터 적재 (이미지당 1행)
marker_df.write \
    .mode("append") \
    .jdbc(url=db_url, table="road_damage_markers", properties=db_properties)

# 2. 라벨 데이터 적재 (객체당 1행)
label_df.write \
    .mode("append") \
    .jdbc(url=db_url, table="road_damage_labels", properties=db_properties)
```

---

## 4. 트러블슈팅 (FAQ)

**Q. `id` 컬럼 관련 에러가 발생합니다.**
Spark DataFrame에 `id` 컬럼이 포함되어 있으면 안 됩니다. DB가 자동 생성(`Identity`)하도록 `.drop("id")` 후 저장하십시오.

**Q. PostgreSQL 연결 시 SSL 에러가 발생합니다.**
JDBC URL 뒤에 `?sslmode=require` 옵션을 추가해 보십시오.
