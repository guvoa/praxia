-- Usuarios de Praxia. Todo usuario puede crear proyectos (rol emprendedor implícito).
CREATE TABLE users (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120)    NOT NULL,
    email         VARCHAR(191)    NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    avatar        VARCHAR(255)    NULL DEFAULT NULL,
    headline      VARCHAR(160)    NULL DEFAULT NULL,
    location      VARCHAR(120)    NULL DEFAULT NULL,
    bio           TEXT            NULL,
    status        ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP       NULL DEFAULT NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
