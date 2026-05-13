package com.escuelafutbol.config;

import com.escuelafutbol.model.Usuario;
import com.escuelafutbol.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("==========================================================");
            log.warn("No hay usuarios en la base de datos.");
            log.warn("Definí ADMIN_EMAIL y ADMIN_PASSWORD como variables de");
            log.warn("entorno y reiniciá el servidor para crear el usuario admin.");
            log.warn("==========================================================");
            return;
        }

        Usuario admin = new Usuario();
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        usuarioRepository.save(admin);
        log.info("Usuario admin creado: {}", adminEmail);
    }
}
