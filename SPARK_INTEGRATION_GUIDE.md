# Spark 데이터 연동 가이드 (Spark Integration Guide)

본 문서는 Apache Spark 환경에서 전처리 및 분석이 완료된 도로 손상 데이터셋(RDD)을 통합 관리 시스템(Backend DB)으로 전송하기 위한 엔지니어용 가이드입니다.

본 시스템은 대용량 데이터의 안정적인 처리를 위해 백엔드 API를 거치지 않고 **Spark에서 데이터베이스(RDBMS)로 직접 Bulk Insert(JDBC)** 하는 방식을 표준으로 채택하고 있습니다.

---

## 1. 대상 데이터베이스 테이블 스펙

Spark DataFrame은 반드시 아래의 테이블 스키마(Schema)와 정확히 일치해야 정상적으로 적재됩니다.

**테이블명**: `road_damage`

| 컬럼명 | 데이터 타입 (DB) | Spark DataFrame 타입 | 설명 | 필수 여부 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` (Auto Increment)| 자동 생성 | 고유 식별자. Spark에서는 **제외(Omit)** 하십시오. DB가 자동 생성합니다. | X |
| `damage_type`| `VARCHAR(255)` | `StringType` | 도로 손상 분류 코드 (예: `D00`, `D10`, `D20`, `D40`) | O |
| `latitude` | `DOUBLE` | `DoubleType` | 손상 위치 위도 (GPS) | O |
| `longitude`| `DOUBLE` | `DoubleType` | 손상 위치 경도 (GPS) | O |
| `captured_at`| `DATETIME(6)` | `TimestampType` | 손상 데이터가 캡처되거나 분석이 완료된 시간 | O |

---

## 2. JDBC Write 권장 옵션

데이터 적재 시 백엔드 조회 성능 저하 및 DB 커넥션 과부하를 방지하기 위해 아래의 옵션을 적용하여 저장해 주십시오.

*   `batchsize`: 최소 1,000 ~ 5,000 수준의 Batch 적용.
*   `mode`: 기존 데이터를 보존하기 위해 반드시 `"append"` 모드 사용. (단, 매번 전체 데이터를 덮어써야 한다면 `"overwrite"` 사용 가능)

---

## 3. 코드 작성 예시

### 3.1. PySpark 예시 코드

```python
from pyspark.sql.functions import current_timestamp

# 1. 처리 완료된 데이터프레임이 있다고 가정 (df)
# 스키마 구성: damage_type(String), latitude(Double), longitude(Double)

# 2. 필수 컬럼인 captured_at이 없다면 현재 시간으로 추가
final_df = df.withColumn("captured_at", current_timestamp())

# 3. DB 접속 정보 설정
# 운영 환경 시 제공받은 MySQL 접속 정보로 변경
db_url = "jdbc:mysql://[DB_HOST]:3306/[DB_NAME]"
db_properties = {
    "user": "your_db_username",
    "password": "your_db_password",
    "driver": "com.mysql.cj.jdbc.Driver",
    "batchsize": "5000" # 대용량 Bulk Insert 필수 옵션
}

# 4. DB로 직접 전송
final_df.write \
    .mode("append") \
    .jdbc(url=db_url, table="road_damage", properties=db_properties)

print("데이터 적재가 완료되었습니다.")
```

### 3.2. Scala 예시 코드

```scala
import org.apache.spark.sql.functions.current_timestamp

// 1. DataFrame 준비 (df)
val finalDF = df.withColumn("captured_at", current_timestamp())

// 2. 접속 속성 세팅
val dbProperties = new java.util.Properties()
dbProperties.put("user", "your_db_username")
dbProperties.put("password", "your_db_password")
dbProperties.put("driver", "com.mysql.cj.jdbc.Driver")
dbProperties.put("batchsize", "5000")

val dbUrl = "jdbc:mysql://[DB_HOST]:3306/[DB_NAME]"

// 3. 적재
finalDF.write
  .mode("append")
  .jdbc(dbUrl, "road_damage", dbProperties)

println("데이터 적재가 완료되었습니다.")
```

---

## 4. 트러블슈팅 (FAQ)

**Q. `id` 컬럼 관련 에러가 발생합니다.**
Spark DataFrame에 `id` 컬럼이 포함되어 있으면 안 됩니다. `id`는 DB의 `Auto Increment`에 의해 자동 부여되어야 합니다. 저장 전 `.drop("id")`를 수행해 주십시오.

**Q. Timezone 이슈로 시간이 다르게 저장됩니다.**
Spark 클러스터의 Timezone과 DB의 Timezone이 다를 경우 발생합니다. Spark 세션 설정 시 `spark.sql.session.timeZone`을 `Asia/Seoul`로 명시해 주시기 바랍니다.
