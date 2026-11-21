-- Perfil de profesionista (puede postularse a vacantes). is_active permite desactivarlo sin perder datos.
CREATE TABLE professional_profiles (
    user_id          BIGINT UNSIGNED  NOT NULL,
    specialty        VARCHAR(120)     NULL DEFAULT NULL,
    skills           TEXT             NULL,
    experience_years TINYINT UNSIGNED NULL DEFAULT NULL,
    portfolio_url    VARCHAR(255)     NULL DEFAULT NULL,
    cv_path          VARCHAR(255)     NULL DEFAULT NULL,
    is_active        TINYINT(1)       NOT NULL DEFAULT 1,
    created_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_professional_profiles_user_id FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
