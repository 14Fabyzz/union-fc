package com.escuelafutbol.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "estudiantes")
public class Estudiante {

    @Id
    private String id;

    @Indexed(unique = true)
    private String identificacion;

    private String nombre;

    private String categoria;

    private String telefono;

    @Builder.Default
    private boolean activo = true;

    @Field("mesesPagados")
    @Builder.Default
    private List<String> mesesPagados = new ArrayList<>();

    @Builder.Default
    private Instant creadoEn = Instant.now();
}
