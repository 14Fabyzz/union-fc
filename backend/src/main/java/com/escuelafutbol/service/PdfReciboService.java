package com.escuelafutbol.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Locale;

@Slf4j
@Service
public class PdfReciboService {

    @Value("${escuela.logo.path}")
    private String logoPath;

    @Value("${escuela.nombre}")
    private String nombreEscuela;

    @Value("${escuela.mensualidad}")
    private String mensualidad;

    private static final Color NAVY      = new Color(14, 29, 92);
    private static final Color RED       = new Color(196, 30, 58);
    private static final Color LIGHT_BG  = new Color(245, 247, 252);
    private static final Color GRAY_TEXT = new Color(100, 110, 130);
    private static final Color WHITE     = Color.WHITE;
    private static final Color BORDER    = new Color(220, 225, 235);

    // ── Fonts con soporte de caracteres especiales (á, é, ó, ú, ñ) ──────────

    private Font font(int size, int style, Color color) {
        try {
            // Busca Arial en Windows; si no existe usa Helvetica con encoding Latin
            String[] candidatos = {
                "C:/Windows/Fonts/arial.ttf",
                "C:/Windows/Fonts/arialbd.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
            };
            String arialBold   = "C:/Windows/Fonts/arialbd.ttf";
            String arialNormal = "C:/Windows/Fonts/arial.ttf";
            String arialItalic = "C:/Windows/Fonts/ariali.ttf";

            String fontPath = (style == Font.BOLD) ? arialBold
                            : (style == Font.ITALIC) ? arialItalic
                            : arialNormal;

            File f = new File(fontPath);
            if (!f.exists()) {
                // Fallback: Helvetica con encoding CP1252 (soporta acentos latinos)
                BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA, "CP1252", BaseFont.NOT_EMBEDDED);
                return new Font(bf, size, style, color);
            }

            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            return new Font(bf, size, style, color);

        } catch (Exception e) {
            log.warn("Font fallback activado: {}", e.getMessage());
            return FontFactory.getFont(FontFactory.HELVETICA, "CP1252", true, size, style, color);
        }
    }

    public byte[] generarRecibo(String nombreJugador, String categoria, String mes) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4, 50, 50, 40, 40);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            PdfContentByte cb = writer.getDirectContent();

            // Fondo
            cb.setColorFill(new Color(248, 249, 253));
            cb.rectangle(0, 0, PageSize.A4.getWidth(), PageSize.A4.getHeight());
            cb.fill();

            // Franja lateral izquierda
            cb.setColorFill(NAVY);
            cb.rectangle(0, 0, 8, PageSize.A4.getHeight());
            cb.fill();

            // ── Header ───────────────────────────────────────────────────────
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{1f, 3f});
            header.setSpacingAfter(24);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setPadding(8);
            logoCell.setBackgroundColor(WHITE);
            try {
                File logoFile = new File(logoPath);
                if (logoFile.exists()) {
                    Image logo = Image.getInstance(logoFile.getAbsolutePath());
                    logo.scaleToFit(80, 80);
                    logoCell.addElement(logo);
                }
            } catch (Exception e) {
                log.warn("Logo no cargado: {}", e.getMessage());
            }

            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setPaddingLeft(16);
            titleCell.setPaddingTop(12);
            titleCell.setBackgroundColor(WHITE);

            Paragraph escuelaNombre = new Paragraph(nombreEscuela.toUpperCase(), font(22, Font.BOLD, NAVY));
            escuelaNombre.setSpacingAfter(4);
            titleCell.addElement(escuelaNombre);

            titleCell.addElement(new Paragraph("Escuela de Futbol", font(11, Font.NORMAL, GRAY_TEXT)));

            Paragraph tagline = new Paragraph("Formando campeones dentro y fuera del campo",
                    font(9, Font.ITALIC, GRAY_TEXT));
            tagline.setSpacingBefore(2);
            titleCell.addElement(tagline);

            header.addCell(logoCell);
            header.addCell(titleCell);
            doc.add(header);

            // ── Banda "RECIBO DE PAGO" ────────────────────────────────────────
            PdfPTable banda = new PdfPTable(1);
            banda.setWidthPercentage(100);
            banda.setSpacingAfter(20);

            PdfPCell bandaCell = new PdfPCell(new Phrase("  RECIBO DE PAGO  ", font(14, Font.BOLD, WHITE)));
            bandaCell.setBackgroundColor(RED);
            bandaCell.setBorder(Rectangle.NO_BORDER);
            bandaCell.setPadding(10);
            bandaCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            banda.addCell(bandaCell);
            doc.add(banda);

            // ── Meta: número y fecha ──────────────────────────────────────────
            String fechaEmision = LocalDate.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern(
                            "d 'de' MMMM 'de' yyyy", new Locale("es", "CO")));
            String numRecibo = "REC-" + LocalDate.now().getYear() + "-"
                    + String.format("%04d", (int)(Math.random() * 9000) + 1000);

            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);
            addMetaCell(metaTable, "No. de Recibo", numRecibo);
            addMetaCell(metaTable, "Fecha de Emision", fechaEmision);
            doc.add(metaTable);

            // ── Sección datos ─────────────────────────────────────────────────
            Paragraph secTitulo = new Paragraph("INFORMACION DE PAGO", font(10, Font.BOLD, NAVY));
            secTitulo.setSpacingBefore(4);
            secTitulo.setSpacingAfter(8);
            doc.add(secTitulo);

            PdfPTable datos = new PdfPTable(2);
            datos.setWidthPercentage(100);
            datos.setWidths(new float[]{1.4f, 2.6f});
            datos.setSpacingAfter(24);

            String mesLabel = formatearMes(mes);

            addDataRow(datos, "Jugador",     nombreJugador, true);
            addDataRow(datos, "Categoria", categoria,  false);
            addDataRow(datos, "Mes",          mesLabel,     true);
            addDataRow(datos, "Concepto",    "Mensualidad", false);
            addDataRow(datos, "Estado",      "PAGADO",      true);
            doc.add(datos);

            // ── Total ─────────────────────────────────────────────────────────
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);
            totalTable.setWidths(new float[]{3f, 1f});
            totalTable.setSpacingAfter(28);

            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL PAGADO", font(13, Font.BOLD, WHITE)));
            totalLabel.setBackgroundColor(NAVY);
            totalLabel.setBorder(Rectangle.NO_BORDER);
            totalLabel.setPadding(12);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPCell totalValor = new PdfPCell(new Phrase("$ " + mensualidad, font(16, Font.BOLD, WHITE)));
            totalValor.setBackgroundColor(RED);
            totalValor.setBorder(Rectangle.NO_BORDER);
            totalValor.setPadding(12);
            totalValor.setHorizontalAlignment(Element.ALIGN_CENTER);

            totalTable.addCell(totalLabel);
            totalTable.addCell(totalValor);
            doc.add(totalTable);

            // ── Mensaje de agradecimiento ─────────────────────────────────────
            PdfPTable gracias = new PdfPTable(1);
            gracias.setWidthPercentage(100);
            gracias.setSpacingAfter(20);

            PdfPCell graciasCell = new PdfPCell();
            graciasCell.setBackgroundColor(LIGHT_BG);
            graciasCell.setBorderColor(BORDER);
            graciasCell.setBorderWidth(1f);
            graciasCell.setPadding(16);

            Paragraph titulo = new Paragraph("Gracias por tu pago!", font(13, Font.BOLD, NAVY));
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(6);
            graciasCell.addElement(titulo);

            Paragraph cuerpo = new Paragraph(
                "Tu compromiso y puntualidad son fundamentales para el crecimiento de " +
                nombreEscuela + ". Con tu apoyo seguimos formando grandes jugadores " +
                "dentro y fuera del campo.\n\nEste documento es tu comprobante oficial de pago.",
                font(10, Font.NORMAL, GRAY_TEXT));
            cuerpo.setAlignment(Element.ALIGN_CENTER);
            graciasCell.addElement(cuerpo);

            gracias.addCell(graciasCell);
            doc.add(gracias);

            // ── Footer ────────────────────────────────────────────────────────
            Paragraph footer = new Paragraph(
                "(c) " + LocalDate.now().getYear() + " " + nombreEscuela +
                "  -  Documento generado automaticamente  -  Valido sin firma",
                font(8, Font.NORMAL, GRAY_TEXT));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Error generando PDF: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudo generar el recibo PDF", e);
        }
    }

    private void addMetaCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(BORDER);
        cell.setBorderWidth(1f);
        cell.setBackgroundColor(WHITE);
        cell.setPadding(10);

        Paragraph lbl = new Paragraph(label, font(8, Font.NORMAL, GRAY_TEXT));
        lbl.setSpacingAfter(3);
        cell.addElement(lbl);
        cell.addElement(new Paragraph(value, font(11, Font.BOLD, NAVY)));
        table.addCell(cell);
    }

    private void addDataRow(PdfPTable table, String label, String value, boolean highlighted) {
        Color bg = highlighted ? LIGHT_BG : WHITE;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, font(10, Font.BOLD, GRAY_TEXT)));
        labelCell.setBackgroundColor(bg);
        labelCell.setBorderColor(BORDER);
        labelCell.setBorderWidth(0.5f);
        labelCell.setPadding(10);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font(10, Font.NORMAL, NAVY)));
        valueCell.setBackgroundColor(bg);
        valueCell.setBorderColor(BORDER);
        valueCell.setBorderWidth(0.5f);
        valueCell.setPadding(10);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String formatearMes(String ym) {
        try {
            YearMonth yearMonth = YearMonth.parse(ym);
            String mes = yearMonth.getMonth()
                    .getDisplayName(java.time.format.TextStyle.FULL, new Locale("es", "CO"));
            return mes.substring(0, 1).toUpperCase() + mes.substring(1) + " " + yearMonth.getYear();
        } catch (Exception e) {
            return ym;
        }
    }
}
