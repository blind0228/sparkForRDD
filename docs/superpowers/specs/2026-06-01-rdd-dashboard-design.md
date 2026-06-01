# Design Spec: Road Damage Dataset (RDD) Dashboard

## 1. Overview
A web-based dashboard to visualize Road Damage Dataset (RDD) analysis results. Data processed by Apache Spark is stored in a relational database, which a Spring Boot backend serves via REST APIs to a React frontend.

## 2. Goals
- Visualize distribution of road damage types using charts.
- Display precise damage locations on an interactive Google Map.
- Provide a searchable list of all recorded damages.

## 3. Technology Stack
- **Frontend**: React (TypeScript), Tailwind CSS, Recharts, Google Maps JavaScript API.
- **Backend**: Java, Spring Boot 3.x, Spring Data JPA.
- **Database**: H2 (Development/Testing), MySQL (Production).
- **Build Tools**: Maven/Gradle (Backend), npm/yarn (Frontend).

## 4. Data Model
### RoadDamage Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| id | Long | Primary Key (Auto-increment) |
| damageType | String | Type of damage (e.g., D00, D10, D20, D40) |
| latitude | Double | GPS Latitude of the damage |
| longitude | Double | GPS Longitude of the damage |
| capturedAt | LocalDateTime | Timestamp when the damage was recorded |

## 5. System Architecture
1.  **Database**: Holds pre-processed data from Spark.
2.  **Spring Boot Backend**:
    - Repository layer for database access.
    - Service layer for business logic (if any).
    - REST Controller providing endpoints:
        - `GET /api/damages`: Returns all damage records.
        - `GET /api/damages/stats`: Returns count per damage type.
3.  **React Frontend**:
    - Dashboard page with multiple components.
    - `StatsComponent`: Fetches `/api/damages/stats` and renders charts.
    - `MapComponent`: Fetches `/api/damages` and renders markers on Google Maps.
    - `ListComponent`: Displays damage details in a table.

## 6. UI/UX Design
- **Header**: Project title and navigation.
- **Main Layout**: Grid-based dashboard.
    - Top row: Summary cards (Total count, most frequent type).
    - Middle row: Chart on the left, Google Map on the right.
    - Bottom row: Data table with pagination.

## 7. Implementation Strategy
1.  **Phase 1**: Backend setup with Spring Boot and H2. Create Entity, Repository, and initial REST API.
2.  **Phase 2**: Frontend setup with React. Integrate Tailwind CSS and basic routing.
3.  **Phase 3**: Integration of Recharts and Google Maps.
4.  **Phase 4**: Migration/Configuration for MySQL.
