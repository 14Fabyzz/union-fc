package com.escuelafutbol.dto;

public record ChangePasswordRequest(String email, String currentPassword, String newPassword) {}
