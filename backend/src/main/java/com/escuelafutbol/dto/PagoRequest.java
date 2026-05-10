package com.escuelafutbol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PagoRequest {

    @NotBlank(message = "El mes es obligatorio")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "El mes debe tener formato YYYY-MM")
    private String mes;
}
