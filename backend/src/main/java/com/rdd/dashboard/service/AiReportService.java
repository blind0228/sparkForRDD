package com.rdd.dashboard.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.rdd.dashboard.dto.CountryStatsDto;
import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.repository.RoadDamageLabelRepository;
import com.rdd.dashboard.repository.RoadDamageMarkerRepository;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiReportService {

    private final RoadDamageMarkerRepository markerRepository;
    private final RoadDamageLabelRepository labelRepository;
    private final Dotenv dotenv;

    public byte[] generateAiReport() {
        // 1. 데이터 수집
        List<CountryStatsDto> countryStats = markerRepository.findCountryStats();
        List<DamageStatsDto> typeStats = labelRepository.findDamageTypeStats();
        
        // 2. AI 분석 요청용 프롬프트 생성
        String prompt = createPrompt(countryStats, typeStats);
        
        // 3. AI API 호출 (OpenAI 호환 API)
        String aiAnalysis = callAiApi(prompt);
        
        // 4. PDF 생성
        return createPdf(aiAnalysis, countryStats, typeStats);
    }

    private String createPrompt(List<CountryStatsDto> countryStats, List<DamageStatsDto> typeStats) {
        String countryInfo = countryStats.stream()
                .map(c -> c.getCountry() + ": " + c.getCount() + "건")
                .collect(Collectors.joining(", "));
        
        String typeInfo = typeStats.stream()
                .map(t -> t.getDamageType() + ": " + t.getCount() + "건")
                .collect(Collectors.joining(", "));

        return "당신은 세계적인 도로 공학 및 인프라 관리 전문가입니다. 아래의 도로 손상 데이터를 바탕으로 정부 부처에 제출할 수준의 전문적인 [도로 안전 진단 보고서]를 한국어로 작성해 주세요.\n\n" +
                "### 데이터 현황 ###\n" +
                "- 국가별 누적 데이터: " + countryInfo + "\n" +
                "- 손상 유형별 분포: " + typeInfo + "\n\n" +
                "### 보고서 구성 가이드라인 ###\n" +
                "1. **개요 (Executive Summary)**: 현재 전반적인 도로 파손 상태를 한 문장으로 진단.\n" +
                "2. **국가별 위험도 분석**: 데이터 밀도가 높은 국가의 지리적/환경적 요인을 분석하고 위험도를 평가.\n" +
                "3. **손상 유형별 집중 분석**: 가장 많이 발생하는 파손 유형(예: 포트홀, 균열 등)이 인프라에 미치는 영향 분석.\n" +
                "4. **기술적 권고 사항**: 도로 수명 연장을 위한 공학적 조치 및 유지보수 우선순위 제안.\n" +
                "5. **결론**: 향후 인프라 안전 확보를 위한 전문가로서의 총평.\n\n" +
                "격식 있고 신뢰감 있는 비즈니스 전문 용어를 사용하여 작성해 주세요.";
    }

    private String callAiApi(String prompt) {
        String apiKey = dotenv.get("OPENAI_API_KEY");
        String model = dotenv.get("OPENAI_MODEL", "gpt-3.5-turbo");
        String baseUrl = dotenv.get("OPENAI_BASE_URL", "https://api.openai.com/v1");

        RestClient restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are a professional road maintenance expert."),
                            Map.of("role", "user", "content", prompt)
                    )
            );

            Map<String, Object> response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        } catch (Exception e) {
            return "AI 분석 호출 중 오류가 발생했습니다: " + e.getMessage();
        }
        return "AI 분석 결과를 가져올 수 없습니다.";
    }

    private byte[] createPdf(String aiAnalysis, List<CountryStatsDto> countryStats, List<DamageStatsDto> typeStats) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            // 한글 폰트 설정 (PDF 기본 아시안 폰트 사용)
            Font titleFont = new Font(com.lowagie.text.pdf.BaseFont.createFont("HYGoThic-Medium", "UniKS-UCS2-H", com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED), 20, Font.BOLD);
            Font subTitleFont = new Font(com.lowagie.text.pdf.BaseFont.createFont("HYGoThic-Medium", "UniKS-UCS2-H", com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED), 14, Font.BOLD);
            Font normalFont = new Font(com.lowagie.text.pdf.BaseFont.createFont("HYGoThic-Medium", "UniKS-UCS2-H", com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED), 10, Font.NORMAL);

            document.add(new Paragraph("도로 손상 데이터 인공지능 분석 보고서", titleFont));
            document.add(new Paragraph("Generated by RDD AI Analytics System", new Font(Font.HELVETICA, 10, Font.ITALIC)));
            document.add(new Paragraph("\n------------------------------------------------------------\n", normalFont));
            
            document.add(new Paragraph("1. 통계 데이터 요약", subTitleFont));
            document.add(new Paragraph("\n", normalFont));
            for (CountryStatsDto c : countryStats) {
                document.add(new Paragraph("   • " + c.getCountry() + ": " + c.getCount() + "건", normalFont));
            }
            document.add(new Paragraph("\n", normalFont));
            
            document.add(new Paragraph("2. AI 전문가 분석 결과", subTitleFont));
            document.add(new Paragraph("\n", normalFont));
            
            // AI 분석 내용을 단락별로 나누어 추가
            String[] paragraphs = aiAnalysis.split("\n");
            for (String p : paragraphs) {
                if (!p.trim().isEmpty()) {
                    document.add(new Paragraph(p.trim(), normalFont));
                }
            }
            
            document.add(new Paragraph("\n\n------------------------------------------------------------", normalFont));
            document.add(new Paragraph("본 보고서는 시스템 데이터를 기반으로 AI가 자동 생성한 문서입니다.", normalFont));
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            document.close();
        }
        return out.toByteArray();
    }
}
