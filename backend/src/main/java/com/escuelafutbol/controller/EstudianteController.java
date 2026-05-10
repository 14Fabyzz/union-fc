package com.escuelafutbol.controller;

import com.escuelafutbol.dto.EstadoRequest;
import com.escuelafutbol.dto.EstudianteRequest;
import com.escuelafutbol.dto.PagoRequest;
import com.escuelafutbol.model.Estudiante;
import com.escuelafutbol.service.EstudianteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/estudiantes")
@RequiredArgsConstructor
public class EstudianteController {

    private final EstudianteService service;

    // GET /api/estudiantes?activos=true
    @GetMapping
    public ResponseEntity<List<Estudiante>> listar(
            @RequestParam(name = "activos", required = false) Boolean activos) {

        List<Estudiante> resultado = Boolean.TRUE.equals(activos)
                ? service.listarActivos()
                : service.listarTodos();

        return ResponseEntity.ok(resultado);
    }

    // POST /api/estudiantes
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody EstudianteRequest req) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/estudiantes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable String id,
            @Valid @RequestBody EstudianteRequest req) {
        try {
            return ResponseEntity.ok(service.actualizar(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PATCH /api/estudiantes/{id}/estado
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String id,
            @RequestBody EstadoRequest req) {
        try {
            return ResponseEntity.ok(service.cambiarEstado(id, req.isActivo()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PATCH /api/estudiantes/{id}/pago
    @PatchMapping("/{id}/pago")
    public ResponseEntity<?> togglePago(
            @PathVariable String id,
            @Valid @RequestBody PagoRequest req) {
        try {
            return ResponseEntity.ok(service.togglePago(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
