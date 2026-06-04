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

        return "당신은 세계적인 도로 유지보수 및 교통안전 전문가입니다. 아래의 실시간 도로 손상 감지 데이터를 분석하여 전문적인 보고서를 작성해 주세요.\n\n" +
                "[데이터 요약]\n" +
                "- 국가별 발생 건수: " + countryInfo + "\n" +
                "- 손상 유형별 건수: " + typeInfo + "\n\n" +
                "[보고서 요구사항]\n" +
                "1. 현재 상황에 대한 요약\n" +
                "2. 가장 위험도가 높은 국가 또는 유형에 대한 심층 분석\n" +
                "3. 향후 도로 안전을 위한 구체적인 유지보수 권고 사항\n\n" +
                "보고서는 한국어로 작성해 주세요.";
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
        PdfWriter.getInstance(document, out);

        document.open();
        
        // OpenPDF는 기본 폰트가 한글을 지원하지 않으므로, 시스템 폰트를 로드하거나 
        // 텍스트 형태로만 일단 구성합니다. (한글 폰트 설정이 복잡할 수 있어 텍스트 위주로)
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Font subTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Font normalFont = new Font(Font.HELVETICA, 11, Font.NORMAL);

        document.add(new Paragraph("Road Damage Analysis Report (AI Powered)", titleFont));
        document.add(new Paragraph("\n"));
        
        document.add(new Paragraph("1. Data Summary", subTitleFont));
        for (CountryStatsDto c : countryStats) {
            document.add(new Paragraph("- " + c.getCountry() + ": " + c.getCount(), normalFont));
        }
        document.add(new Paragraph("\n"));
        
        document.add(new Paragraph("2. AI Analysis & Recommendations", subTitleFont));
        document.add(new Paragraph(aiAnalysis, normalFont));
        
        document.close();
        return out.toByteArray();
    }
}
