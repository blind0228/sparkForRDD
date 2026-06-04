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
        Document document = new Document(com.lowagie.text.PageSize.A4, 50, 50, 50, 50);
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            // 한글 폰트 설정
            com.lowagie.text.pdf.BaseFont objBaseFont = com.lowagie.text.pdf.BaseFont.createFont("HYGoThic-Medium", "UniKS-UCS2-H", com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
            Font titleFont = new Font(objBaseFont, 22, Font.BOLD, new java.awt.Color(0, 88, 190));
            Font subTitleFont = new Font(objBaseFont, 16, Font.BOLD, new java.awt.Color(59, 130, 246));
            Font tableHeaderFont = new Font(objBaseFont, 10, Font.BOLD, java.awt.Color.WHITE);
            Font normalFont = new Font(objBaseFont, 10, Font.NORMAL, new java.awt.Color(31, 41, 55));
            Font footerFont = new Font(objBaseFont, 8, Font.ITALIC, java.awt.Color.GRAY);

            // Header Section
            Paragraph mainTitle = new Paragraph("ROAD DAMAGE ANALYSIS REPORT", titleFont);
            mainTitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(mainTitle);
            
            Paragraph subHeader = new Paragraph("AI-Powered Infrastructure Intelligence System", new Font(Font.HELVETICA, 10, Font.NORMAL, java.awt.Color.GRAY));
            subHeader.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(subHeader);
            
            document.add(new Paragraph("\n"));
            com.lowagie.text.pdf.draw.LineSeparator line = new com.lowagie.text.pdf.draw.LineSeparator();
            line.setLineColor(new java.awt.Color(226, 232, 240));
            document.add(new com.lowagie.text.Chunk(line));
            document.add(new Paragraph("\n"));

            // 1. Statistics Table Section
            document.add(new Paragraph("1. 핵심 통계 요약 (Statistical Summary)", subTitleFont));
            document.add(new Paragraph("\n"));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // Table Header
            com.lowagie.text.pdf.PdfPCell header1 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("국가 (Country)", tableHeaderFont));
            header1.setBackgroundColor(new java.awt.Color(0, 88, 190));
            header1.setPadding(8f);
            table.addCell(header1);

            com.lowagie.text.pdf.PdfPCell header2 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("감지 건수 (Detections)", tableHeaderFont));
            header2.setBackgroundColor(new java.awt.Color(0, 88, 190));
            header2.setPadding(8f);
            table.addCell(header2);

            // Table Body
            for (CountryStatsDto c : countryStats) {
                com.lowagie.text.pdf.PdfPCell cellName = new com.lowagie.text.pdf.PdfPCell(new Paragraph(c.getCountry(), normalFont));
                cellName.setPadding(5f);
                table.addCell(cellName);

                com.lowagie.text.pdf.PdfPCell cellCount = new com.lowagie.text.pdf.PdfPCell(new Paragraph(String.format("%,d건", c.getCount()), normalFont));
                cellCount.setPadding(5f);
                cellCount.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
                table.addCell(cellCount);
            }
            document.add(table);
            document.add(new Paragraph("\n"));

            // 2. AI Analysis Section
            document.add(new Paragraph("2. AI 데이터 심층 분석 (Expert Insights)", subTitleFont));
            document.add(new Paragraph("\n"));
            
            String[] paragraphs = aiAnalysis.split("\n");
            for (String p : paragraphs) {
                if (!p.trim().isEmpty()) {
                    Paragraph para = new Paragraph(p.trim(), normalFont);
                    para.setSpacingAfter(8f);
                    para.setLeading(15f); // 줄간격
                    document.add(para);
                }
            }
            
            // Footer
            document.add(new Paragraph("\n\n"));
            document.add(new com.lowagie.text.Chunk(line));
            Paragraph footer = new Paragraph("본 보고서는 실시간 도로 관리 시스템의 데이터를 기반으로 AI가 자동 생성하였습니다. 생성 일시: " + new java.util.Date().toString(), footerFont);
            footer.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            document.add(footer);
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            document.close();
        }
        return out.toByteArray();
    }
}
