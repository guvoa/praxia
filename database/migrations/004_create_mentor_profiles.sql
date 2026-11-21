-- Perfil de mentor (ofrece mentoría a proyectos).
CREATE TABLE mentor_profiles (
    user_id         BIGINT UNSIGNED NOT NULL,
    expertise_areas VARCHAR(255)    NULL DEFAULT NULL,
    availability    VARCHAR(120)    NULL DEFAULT NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_mentor_profiles_user_id FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
