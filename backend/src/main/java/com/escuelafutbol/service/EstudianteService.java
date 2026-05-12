package com.escuelafutbol.service;

import com.escuelafutbol.dto.EstudianteRequest;
import com.escuelafutbol.dto.PagoRequest;
import com.escuelafutbol.model.Estudiante;
import com.escuelafutbol.repository.EstudianteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EstudianteService {

    private final EstudianteRepository repo;
    private final WhatsAppService whatsAppService;

    // ── Consultas ────────────────────────────────────────────────────────────

    public List<Estudiante> listarTodos() {
        return repo.findAllByOrderByNombreAsc();
    }

    public List<Estudiante> listarActivos() {
        return repo.findByActivoTrueOrderByNombreAsc();
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public Estudiante crear(EstudianteRequest req) {
        if (repo.findByIdentificacion(req.getIdentificacion()).isPresent()) {
            throw new IllegalArgumentException(
                "Ya existe un jugador con la identificación: " + req.getIdentificacion());
        }
        Estudiante e = Estudiante.builder()
                .identificacion(req.getIdentificacion().trim())
                .nombre(req.getNombre().trim())
                .categoria(req.getCategoria().trim())
                .telefono(req.getTelefono() != null ? req.getTelefono().trim() : null)
                .build();
        Estudiante saved = repo.save(e);
        log.debug("Jugador creado: {}", saved.getId());
        return saved;
    }

    public Estudiante actualizar(String id, EstudianteRequest req) {
        Estudiante e = buscarPorId(id);

        // Verificar duplicado de identificación en otro documento
        repo.findByIdentificacion(req.getIdentificacion())
                .filter(found -> !found.getId().equals(id))
                .ifPresent(dup -> {
                    throw new IllegalArgumentException(
                        "La identificación ya está en uso por otro jugador");
                });

        e.setIdentificacion(req.getIdentificacion().trim());
        e.setNombre(req.getNombre().trim());
        e.setCategoria(req.getCategoria().trim());
        e.setTelefono(req.getTelefono() != null ? req.getTelefono().trim() : null);
        return repo.save(e);
    }

    // ── Soft Delete / Activación ─────────────────────────────────────────────

    public Estudiante cambiarEstado(String id, boolean activo) {
        Estudiante e = buscarPorId(id);
        e.setActivo(activo);
        log.debug("Jugador {} → activo={}", id, activo);
        return repo.save(e);
    }

    // ── Toggle de Pago ───────────────────────────────────────────────────────

    public Estudiante togglePago(String id, PagoRequest req) {
        Estudiante e = buscarPorId(id);
        String mes = req.getMes();

        boolean seEstaMarcandoPagado = !e.getMesesPagados().contains(mes);

        if (!seEstaMarcandoPagado) {
            e.getMesesPagados().remove(mes);
            log.debug("Pago revertido: jugador={} mes={}", id, mes);
        } else {
            e.getMesesPagados().add(mes);
            log.debug("Pago registrado: jugador={} mes={}", id, mes);
        }

        Estudiante saved = repo.save(e);

        if (seEstaMarcandoPagado) {
            whatsAppService.enviarFactura(saved.getTelefono(), saved.getNombre(), saved.getCategoria(), mes);
        }

        return saved;
    }

    // ── Utilidades ───────────────────────────────────────────────────────────

    private Estudiante buscarPorId(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jugador no encontrado: " + id));
    }
}
