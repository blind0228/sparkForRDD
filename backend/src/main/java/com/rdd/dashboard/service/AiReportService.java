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

        return "당신은 세계적인 데이터 사이언티스트이자 글로벌 인프라 정책 고문입니다. 제공된 정밀 데이터를 바탕으로 최고 수준의 [글로벌 도로 인프라 분석 보고서]를 한국어로 작성하세요.\n\n" +
                "### 실시간 관측 데이터 현황 ###\n" +
                "1. 국가별 누적: [" + countryInfo + "]\n" +
                "2. 글로벌 유형 분포: [" + typeInfo + "]\n" +
                "3. 국가별-유형별 세부 통계: [" + detailedStats + "]\n\n" +
                "### 보고서 작성 필수 지침 ###\n" +
                "- **국가별 세밀 분석**: 각 나라별로 어떤 파손이 가장 지배적인지 수치적으로 지목하고, 그 원인을 해당 국가의 '기후적 특성'(예: 인도의 몬순, 일본의 지진/습도 등)이나 최근 인프라 관련 이슈와 결합하여 분석하세요.\n" +
                "- **유형별 인프라 진단**: D00(종방향), D20(포트홀) 등 구체적 파손 코드가 각 국가의 도로 수명에 미치는 공학적 영향을 분석하세요.\n" +
                "- **글로벌 통찰**: 데이터로 증명된 현상을 바탕으로, 국가별 맞춤형 유지보수 전략을 제안하세요.\n" +
                "- **결론 및 제언**: 각 국가의 지리적/사회적 배경을 고려한 인프라 안전 총평을 작성하세요.\n\n" +
                "작성 언어: 한국어\n" +
                "톤: 고도로 전문적이고 통찰력 있는 학술적 리포트 스타일";
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
            
            com.lowagie.text.pdf.BaseFont objBaseFont = com.lowagie.text.pdf.BaseFont.createFont("HYGoThic-Medium", "UniKS-UCS2-H", com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
            Font titleFont = new Font(objBaseFont, 24, Font.BOLD, new java.awt.Color(0, 88, 190));
            Font subTitleFont = new Font(objBaseFont, 14, Font.BOLD, new java.awt.Color(59, 130, 246));
            Font tableHeaderFont = new Font(objBaseFont, 9, Font.BOLD, java.awt.Color.WHITE);
            Font normalFont = new Font(objBaseFont, 9, Font.NORMAL, new java.awt.Color(31, 41, 55));
            Font footerFont = new Font(objBaseFont, 8, Font.ITALIC, java.awt.Color.GRAY);

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
            document.add(new Paragraph("\n1. 국가별 감지 현황 (Country Detections)", subTitleFont));
            com.lowagie.text.pdf.PdfPTable countryTable = new com.lowagie.text.pdf.PdfPTable(2);
            countryTable.setWidthPercentage(100);
            countryTable.setSpacingBefore(10f);
            
            addTableCell(countryTable, "국가명 (Country)", tableHeaderFont, new java.awt.Color(0, 88, 190));
            addTableCell(countryTable, "누적 건수 (Count)", tableHeaderFont, new java.awt.Color(0, 88, 190));

            for (CountryStatsDto c : countryStats) {
                addTableCell(countryTable, c.getCountry(), normalFont, null);
                addTableCell(countryTable, String.format("%,d건", c.getCount()), normalFont, null, com.lowagie.text.Element.ALIGN_RIGHT);
            }
            document.add(countryTable);

            // 2. Damage Type Breakdown Table
            document.add(new Paragraph("\n2. 국가별-파손유형별 세부 통계 (Damage Type Breakdown)", subTitleFont));
            com.lowagie.text.pdf.PdfPTable typeTable = new com.lowagie.text.pdf.PdfPTable(3);
            typeTable.setWidthPercentage(100);
            typeTable.setSpacingBefore(10f);
            
            addTableCell(typeTable, "국가 (Country)", tableHeaderFont, new java.awt.Color(59, 130, 246));
            addTableCell(typeTable, "파손 유형 (Type)", tableHeaderFont, new java.awt.Color(59, 130, 246));
            addTableCell(typeTable, "발생 건수 (Count)", tableHeaderFont, new java.awt.Color(59, 130, 246));

            for (Object[] row : rawCountryTypeStats) {
                addTableCell(typeTable, (String)row[0], normalFont, null);
                addTableCell(typeTable, (String)row[1], normalFont, null);
                addTableCell(typeTable, String.format("%,d건", ((Number)row[2]).longValue()), normalFont, null, com.lowagie.text.Element.ALIGN_RIGHT);
            }
            document.add(typeTable);

            // 3. AI Analysis
            document.newPage();
            document.add(new Paragraph("3. AI 전문가 심층 분석 및 정책 제언", subTitleFont));
            document.add(new Paragraph("\n"));
            
            String[] paragraphs = aiAnalysis.split("\n");
            for (String p : paragraphs) {
                if (!p.trim().isEmpty()) {
                    Paragraph para = new Paragraph(p.trim(), normalFont);
                    para.setSpacingAfter(6f);
                    para.setLeading(14f);
                    document.add(para);
                }
            }
            
            document.add(new Paragraph("\n\n"));
            document.add(new com.lowagie.text.Chunk(line));
            Paragraph footer = new Paragraph("본 보고서는 RDD AI 관제 시스템에 의해 실시간 데이터 분석을 거쳐 생성되었습니다.", footerFont);
            footer.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            document.add(footer);
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            document.close();
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
