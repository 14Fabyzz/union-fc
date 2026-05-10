package com.escuelafutbol.repository;

import com.escuelafutbol.model.Estudiante;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstudianteRepository extends MongoRepository<Estudiante, String> {

    List<Estudiante> findByActivoTrue();

    List<Estudiante> findAllByOrderByNombreAsc();

    List<Estudiante> findByActivoTrueOrderByNombreAsc();

    Optional<Estudiante> findByIdentificacion(String identificacion);
}
