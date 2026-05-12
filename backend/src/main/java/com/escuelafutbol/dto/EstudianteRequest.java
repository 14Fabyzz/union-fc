package com.escuelafutbol.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EstudianteRequest {

    @NotBlank(message = "La identificación es obligatoria")
    private String identificacion;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    private String telefono;
}
