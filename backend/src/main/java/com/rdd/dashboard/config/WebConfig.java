package com.rdd.dashboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬 경로의 이미지를 /images/** 경로로 매핑
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///Users/blind/N-RDD2024-2/TestDataSet/")
                .setCachePeriod(0)
                .resourceChain(true);
    }
}
