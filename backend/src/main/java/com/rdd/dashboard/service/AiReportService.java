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
        List<Object[]> rawCountryTypeStats = labelRepository.findCountryDamageTypeStats();
        
        // 2. AI 분석 요청용 프롬프트 생성
        String prompt = createPrompt(countryStats, typeStats, rawCountryTypeStats);
        
        // 3. AI API 호출
        String aiAnalysis = callAiApi(prompt);
        
        // 4. PDF 생성
        return createPdf(aiAnalysis, countryStats, rawCountryTypeStats);
    }

    private String createPrompt(List<CountryStatsDto> countryStats, List<DamageStatsDto> typeStats, List<Object[]> rawCountryTypeStats) {
        String countryInfo = countryStats.stream()
                .map(c -> c.getCountry() + ": " + c.getCount() + "건")
                .collect(Collectors.joining(", "));
        
        String typeInfo = typeStats.stream()
                .map(t -> t.getDamageType() + ": " + t.getCount() + "건")
                .collect(Collectors.joining(", "));

        String detailedStats = rawCountryTypeStats.stream()
                .map(row -> String.format("[%s - %s: %s건]", row[0], row[1], row[2]))
                .collect(Collectors.joining(", "));

        return "당신은 UN 산하 글로벌 인프라 자문위원단의 '수석 도로 공학 전략가'입니다. 제공된 실시간 빅데이터를 기반으로 각 국가의 인프라 안보 및 자산 관리 전략을 결정짓는 최고 수준의 [글로벌 도로 안보 진단 보고서]를 작성하세요.\n\n" +
                "### 시스템 실시간 빅데이터 ###\n" +
                "1. 국가별 관측 지표: [" + countryInfo + "]\n" +
                "2. 글로벌 파손 유형 분포: [" + typeInfo + "]\n" +
                "3. 국가별-유형별 상관 통계: [" + detailedStats + "]\n\n" +
                "### 분석 핵심 요구사항 (필수 포함 항목) ###\n" +
                "- **데이터 증거주의 진단**: 모든 결론은 제공된 수치에서 시작하세요. 가장 밀집도가 높은 국가와 파손 유형을 지목하고 전체 시스템 리스크에서 차지하는 비중을 계산하세요.\n" +
                "- **인과관계 모델링 (기후/지정학)**: 특정 국가의 지형적 특성(예: 인도의 몬순 기후, 일본의 지진/염해 등)과 지배적 파손 유형 간의 공학적 인과관계를 설명하세요.\n" +
                "- **경제적 리스크 평가 (Economic Impact)**: 파손 데이터 밀집 지역의 보수 지연이 국가 물류망 및 시민 안전에 미치는 리스크를 등급화(Critical, High, Medium)하고 예상 손실을 정성적으로 분석하세요.\n" +
                "- **기술적 로드맵 및 정책 제언**: 단순 수리를 넘어 스마트 인프라(AI 센서, 자가 치유 포장재 등) 도입을 포함한 3단계(단기/중기/장기) 유지보수 로드맵을 제안하세요.\n\n" +
                "### 문서 스타일 가이드 ###\n" +
                "- 최고 경영자(CEO)나 국가 정책 결정권자가 읽는 느낌의 단호하고 권위 있는 문체를 사용하세요.\n" +
                "- 전문적인 공학 및 비즈니스 용어(예: Opportunity Cost, Infrastructure Integrity, Predictive Maintenance 등)를 적절히 활용하세요.\n" +
                "- 언어: 한국어 (전문 용어 병기 가능)";
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

    private byte[] createPdf(String aiAnalysis, List<CountryStatsDto> countryStats, List<Object[]> rawCountryTypeStats) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(com.lowagie.text.PageSize.A4, 40, 40, 40, 40);
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            // 폰트 설정 (한글 지원을 위해 가급적 Asian Font Pack 활용, 실패 시 헬베티카 폴백)
            Font titleFont, subTitleFont, tableHeaderFont, normalFont, footerFont;
            try {
                com.lowagie.text.pdf.BaseFont objBaseFont = com.lowagie.text.pdf.BaseFont.createFont("HYGoThic-Medium", "UniKS-UCS2-H", com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
                titleFont = new Font(objBaseFont, 24, Font.BOLD, new java.awt.Color(0, 88, 190));
                subTitleFont = new Font(objBaseFont, 14, Font.BOLD, new java.awt.Color(59, 130, 246));
                tableHeaderFont = new Font(objBaseFont, 9, Font.BOLD, java.awt.Color.WHITE);
                normalFont = new Font(objBaseFont, 9, Font.NORMAL, new java.awt.Color(31, 41, 55));
                footerFont = new Font(objBaseFont, 8, Font.ITALIC, java.awt.Color.GRAY);
            } catch (Exception e) {
                System.err.println("Korean font loading failed, falling back to Helvetica: " + e.getMessage());
                titleFont = new Font(Font.HELVETICA, 24, Font.BOLD, new java.awt.Color(0, 88, 190));
                subTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD, new java.awt.Color(59, 130, 246));
                tableHeaderFont = new Font(Font.HELVETICA, 9, Font.BOLD, java.awt.Color.WHITE);
                normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new java.awt.Color(31, 41, 55));
                footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, java.awt.Color.GRAY);
            }

            // Header
            Paragraph mainTitle = new Paragraph("ROAD DAMAGE INTELLIGENCE REPORT", titleFont);
            mainTitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(mainTitle);
            
            String timestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());
            Paragraph datePara = new Paragraph("Report Generated at: " + timestamp, new Font(Font.HELVETICA, 9, Font.NORMAL, java.awt.Color.GRAY));
            datePara.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(datePara);
            
            document.add(new Paragraph("\n"));
            com.lowagie.text.pdf.draw.LineSeparator line = new com.lowagie.text.pdf.draw.LineSeparator();
            line.setLineColor(new java.awt.Color(203, 213, 225));
            document.add(new com.lowagie.text.Chunk(line));

            // 1. Country Stats Table
            document.add(new Paragraph("\n1. Country Detections Status", subTitleFont));
            if (countryStats == null || countryStats.isEmpty()) {
                document.add(new Paragraph("No data available for country statistics.", normalFont));
            } else {
                com.lowagie.text.pdf.PdfPTable countryTable = new com.lowagie.text.pdf.PdfPTable(2);
                countryTable.setWidthPercentage(100);
                countryTable.setSpacingBefore(10f);
                
                addTableCell(countryTable, "Country", tableHeaderFont, new java.awt.Color(0, 88, 190));
                addTableCell(countryTable, "Count", tableHeaderFont, new java.awt.Color(0, 88, 190));

                for (CountryStatsDto c : countryStats) {
                    addTableCell(countryTable, c.getCountry(), normalFont, null);
                    addTableCell(countryTable, String.format("%,d", c.getCount()), normalFont, null, com.lowagie.text.Element.ALIGN_RIGHT);
                }
                document.add(countryTable);
            }

            // 2. Damage Type Breakdown Table
            document.newPage();
            document.add(new Paragraph("\n2. Damage Type Detailed Statistics", subTitleFont));
            if (rawCountryTypeStats == null || rawCountryTypeStats.isEmpty()) {
                document.add(new Paragraph("No detailed breakdown data available.", normalFont));
            } else {
                com.lowagie.text.pdf.PdfPTable typeTable = new com.lowagie.text.pdf.PdfPTable(3);
                typeTable.setWidthPercentage(100);
                typeTable.setSpacingBefore(10f);
                
                addTableCell(typeTable, "Country", tableHeaderFont, new java.awt.Color(59, 130, 246));
                addTableCell(typeTable, "Damage Type", tableHeaderFont, new java.awt.Color(59, 130, 246));
                addTableCell(typeTable, "Count", tableHeaderFont, new java.awt.Color(59, 130, 246));

                for (Object[] row : rawCountryTypeStats) {
                    addTableCell(typeTable, String.valueOf(row[0]), normalFont, null);
                    addTableCell(typeTable, String.valueOf(row[1]), normalFont, null);
                    addTableCell(typeTable, String.format("%,d", ((Number)row[2]).longValue()), normalFont, null, com.lowagie.text.Element.ALIGN_RIGHT);
                }
                document.add(typeTable);
            }

            // 3. AI Analysis
            document.newPage();
            document.add(new Paragraph("3. AI Strategic Analysis & Recommendations", subTitleFont));
            document.add(new Paragraph("\n"));
            
            if (aiAnalysis == null || aiAnalysis.trim().isEmpty()) {
                document.add(new Paragraph("AI Analysis could not be generated at this time.", normalFont));
            } else {
                String[] paragraphs = aiAnalysis.split("\n");
                for (String p : paragraphs) {
                    if (!p.trim().isEmpty()) {
                        Paragraph para = new Paragraph(p.trim(), normalFont);
                        para.setSpacingAfter(6f);
                        para.setLeading(14f);
                        document.add(para);
                    }
                }
            }
            
            document.add(new Paragraph("\n\n"));
            document.add(new com.lowagie.text.Chunk(line));
            Paragraph footer = new Paragraph("This report was generated automatically by RDD AI Intelligence System.", footerFont);
            footer.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            document.add(footer);
            
        } catch (Exception e) {
            System.err.println("Error generating PDF: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
        return out.toByteArray();
    }

    private void addTableCell(com.lowagie.text.pdf.PdfPTable table, String text, Font font, java.awt.Color bgColor) {
        addTableCell(table, text, font, bgColor, com.lowagie.text.Element.ALIGN_LEFT);
    }

    private void addTableCell(com.lowagie.text.pdf.PdfPTable table, String text, Font font, java.awt.Color bgColor, int align) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new Paragraph(text, font));
        if (bgColor != null) cell.setBackgroundColor(bgColor);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(com.lowagie.text.Element.ALIGN_MIDDLE);
        table.addCell(cell);
    }
}
