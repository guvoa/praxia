<?php

declare(strict_types=1);

return [
    'name'     => env('APP_NAME', 'Praxia'),
    'env'      => env('APP_ENV', 'production'),
    'debug'    => env('APP_DEBUG', false),
    'url'      => rtrim((string) env('APP_URL', 'http://localhost/praxia'), '/'),
    'timezone' => env('APP_TIMEZONE', 'America/Mexico_City'),
    'locale'   => env('APP_LOCALE', 'es'),

    'session' => [
        'name'     => env('SESSION_NAME', 'praxia_session'),
        'lifetime' => (int) env('SESSION_LIFETIME', 120), // minutos
    ],

    'uploads' => [
        'max_size_mb' => (int) env('UPLOAD_MAX_SIZE', 5),
        'path'        => BASE_PATH . '/storage/uploads',
    ],
];
