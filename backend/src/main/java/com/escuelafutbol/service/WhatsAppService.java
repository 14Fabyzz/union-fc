package com.escuelafutbol.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.YearMonth;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppService {

    @Value("${evolution.api.url}")
    private String apiUrl;

    @Value("${evolution.api.key}")
    private String apiKey;

    @Value("${evolution.instance.name}")
    private String instanceName;

    private final PdfReciboService pdfReciboService;
    private final RestTemplate restTemplate = new RestTemplate();

    public void enviarFactura(String telefono, String nombreJugador, String categoria, String mes) {
        if (telefono == null || telefono.isBlank()) {
            log.warn("WhatsApp omitido: jugador '{}' no tiene teléfono registrado", nombreJugador);
            return;
        }

        String numero  = limpiarNumero(telefono);
        String mesLabel = formatearMes(mes);

        try {
            byte[] pdfBytes = pdfReciboService.generarRecibo(nombreJugador, categoria, mes);
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String fileName  = "Recibo-" + nombreJugador.split(" ")[0] + "-" + mesLabel.replace(" ", "-") + ".pdf";

            enviarPdf(numero, pdfBase64, fileName, nombreJugador, mesLabel);
        } catch (Exception e) {
            log.error("Error enviando WhatsApp PDF a {}: {}", numero, e.getMessage());
        }
    }

    // ── Privados ─────────────────────────────────────────────────────────────

    private void enviarPdf(String numero, String pdfBase64, String fileName,
                           String nombre, String mesLabel) {
        String url = apiUrl + "/message/sendMedia/" + instanceName;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);

        Map<String, Object> body = Map.of(
            "number", numero,
            "mediaMessage", Map.of(
                "mediatype", "document",
                "mimetype",  "application/pdf",
                "media",     pdfBase64,
                "fileName",  fileName,
                "caption",   "Recibo de pago " + mesLabel + " - " + nombre
            )
        );

        ResponseEntity<String> res = restTemplate.exchange(
            url, HttpMethod.POST,
            new HttpEntity<>(body, headers),
            String.class
        );
        log.info("PDF enviado a {} → status {}", numero, res.getStatusCode());
    }

    private String limpiarNumero(String telefono) {
        return telefono.replaceAll("[^0-9]", "");
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
