package com.rdd.dashboard.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.index.strtree.STRtree;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GeoTools를 사용하여 육지와 바다를 구분하는 서비스
 */
@Service
@Slf4j
public class SpatialService {

    private STRtree spatialIndex;
    private final GeometryFactory geometryFactory = new GeometryFactory();
    private boolean isInitialized = false;
    private int polygonCount = 0;

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("data/ne_110m_land.shp");
            if (!resource.exists()) {
                log.error("CRITICAL: Shapefile NOT FOUND at classpath:data/ne_110m_land.shp");
                return;
            }

            File file;
            try {
                file = resource.getFile();
            } catch (IOException e) {
                log.warn("Could not get File from resource: {}", e.getMessage());
                return;
            }
            log.info("Loading shapefile from: {}", file.getAbsolutePath());

            Map<String, Object> map = new HashMap<>();
            map.put("url", file.toURI().toURL());

            DataStore dataStore = DataStoreFinder.getDataStore(map);
            if (dataStore == null) {
                log.error("CRITICAL: DataStore is NULL. Check if .dbf and .shx files are in the same directory.");
                return;
            }

            String typeName = dataStore.getTypeNames()[0];
            FeatureSource<SimpleFeatureType, SimpleFeature> source = dataStore.getFeatureSource(typeName);
            FeatureCollection<SimpleFeatureType, SimpleFeature> collection = source.getFeatures();

            spatialIndex = new STRtree();
            try (FeatureIterator<SimpleFeature> features = collection.features()) {
                while (features.hasNext()) {
                    SimpleFeature feature = features.next();
                    Geometry geometry = (Geometry) feature.getDefaultGeometry();
                    if (geometry != null) {
                        spatialIndex.insert(geometry.getEnvelopeInternal(), geometry);
                        polygonCount++;
                    }
                }
            }
            spatialIndex.build();
            dataStore.dispose();
            
            if (polygonCount > 0) {
                isInitialized = true;
                log.info("SpatialService successfully initialized. Loaded {} land polygons.", polygonCount);
            } else {
                log.warn("SpatialService initialized but NO land polygons were loaded.");
            }
        } catch (Exception e) {
            log.error("Failed to initialize SpatialService: {}", e.getMessage(), e);
        }
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public int getPolygonCount() {
        return polygonCount;
    }

    public boolean isPointOnLand(double latitude, double longitude) {
        if (!isInitialized) {
            // 디버깅을 위해 초기화되지 않았을 경우 false 반환하여 모든 마커를 숨김
            log.warn("SpatialService not initialized, hiding marker at {}, {}", latitude, longitude);
            return false;
        }

        // JTS Point 생성 (longitude, latitude 순서 주의)
        Point point = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(longitude, latitude));
        
        @SuppressWarnings("unchecked")
        List<Geometry> candidates = spatialIndex.query(point.getEnvelopeInternal());
        
        for (Geometry geometry : candidates) {
            // 해상도가 낮은 쉐이프파일의 경우 경계선 처리를 위해 distance(point) < epsilon 등의 처리를 할 수 있지만
            // 기본적으로는 contains를 사용합니다.
            if (geometry.contains(point)) {
                return true;
            }
        }
        
        log.debug("Point filtered out (on sea): {}, {}", latitude, longitude);
        return false;
    }
}
