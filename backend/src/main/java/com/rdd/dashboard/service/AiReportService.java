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

        return "당신은 고도의 정밀 데이터 분석가이자 도로 공학 전문가입니다. 제공된 실시간 수치 데이터를 '철저히 근거로' 분석하여 전문적인 보고서를 작성하세요. 추측보다는 데이터 간의 비교와 현상 분석에 집중해 주세요.\n\n" +
                "### 실시간 관측 데이터 ###\n" +
                "1. 국가별 데이터 분포: [" + countryInfo + "]\n" +
                "2. 손상 유형별 발생 건수: [" + typeInfo + "]\n\n" +
                "### 분석 지침 ###\n" +
                "- **데이터 기반 진단**: 가장 높은 수치를 기록한 국가와 유형을 지목하고, 전체 데이터에서 차지하는 비중을 분석하세요.\n" +
                "- **국가별 비교 분석**: 데이터가 가장 많은 국가와 적은 국가의 차이를 수치적으로 비교하고, 해당 국가에서 어떤 파손 유형이 지배적인지 데이터를 통해 판단하세요.\n" +
                "- **유형별 상관관계**: 특정 파손 유형(예: D20 포트홀)이 특정 국가에서 집중적으로 발생하는 경우, 이를 데이터적 특이사항으로 기록하세요.\n" +
                "- **수치적 전망**: 현재의 누적 데이터 속도를 고려할 때 향후 관리가 시급한 지점을 데이터 우선순위에 따라 제안하세요.\n\n" +
                "작성 언어: 한국어\n" +
                "톤: 객관적, 분석적, 전문적 (데이터 수치에 기반한 단호한 어조 사용)";
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
