-- Perfil de inversor (manifiesta interés y propone montos; sin pagos en la plataforma).
CREATE TABLE investor_profiles (
    user_id           BIGINT UNSIGNED NOT NULL,
    investment_min    DECIMAL(14, 2)  NULL DEFAULT NULL,
    investment_max    DECIMAL(14, 2)  NULL DEFAULT NULL,
    preferred_sectors VARCHAR(255)    NULL DEFAULT NULL,
    is_active         TINYINT(1)      NOT NULL DEFAULT 1,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_investor_profiles_user_id FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
