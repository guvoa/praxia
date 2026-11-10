<?php

declare(strict_types=1);

/**
 * Praxia — ejecutor de migraciones SQL.
 *
 * Uso (desde la raíz del proyecto):
 *   php .agents/skills/db-migration/scripts/migrate.php [--status|--dry-run|--seed|--create-db]
 */

if (PHP_SAPI !== 'cli') {
    exit("Solo se puede ejecutar desde la línea de comandos.\n");
}

$root = dirname(__DIR__, 4);
$migrationsDir = $root . '/database/migrations';
$seedsDir = $root . '/database/seeds';

$options = array_slice($argv, 1);
$known = ['--status', '--dry-run', '--seed', '--create-db', '--help'];
foreach ($options as $option) {
    if (!in_array($option, $known, true)) {
        fail("Opción desconocida: {$option}. Usa --help.");
    }
}

if (in_array('--help', $options, true)) {
    echo <<<TXT
    Uso: php migrate.php [opción]
      (sin opción)  Aplica las migraciones pendientes
      --status      Muestra migraciones aplicadas y pendientes
      --dry-run     Muestra lo que se aplicaría sin ejecutar
      --seed        Ejecuta todos los seeds de database/seeds/
      --create-db   Crea la base de datos DB_DATABASE si no existe

    TXT;
    exit(0);
}

$env = loadEnv($root . '/.env');
$dbName = $env['DB_DATABASE'] ?? '';
if ($dbName === '' || !preg_match('/^[A-Za-z0-9_]+$/', $dbName)) {
    fail('DB_DATABASE no definido o inválido en .env');
}

if (in_array('--create-db', $options, true)) {
    $pdo = connect($env, null);
    $charset = $env['DB_CHARSET'] ?? 'utf8mb4';
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$charset} COLLATE {$charset}_unicode_ci");
    echo "Base de datos `{$dbName}` lista.\n";
    exit(0);
}

$pdo = connect($env, $dbName);
$pdo->exec(
    'CREATE TABLE IF NOT EXISTS migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(191) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

if (in_array('--seed', $options, true)) {
    $seeds = sqlFiles($seedsDir);
    if ($seeds === []) {
        echo "No hay seeds en database/seeds/.\n";
        exit(0);
    }
    foreach ($seeds as $file) {
        runFile($pdo, $seedsDir . '/' . $file);
        echo "  ✔ seed {$file}\n";
    }
    exit(0);
}

$applied = $pdo->query('SELECT migration FROM migrations ORDER BY migration')->fetchAll(PDO::FETCH_COLUMN);
$all = sqlFiles($migrationsDir);
$pending = array_values(array_diff($all, $applied));

if (in_array('--status', $options, true)) {
    echo "Aplicadas (" . count($applied) . "):\n";
    foreach ($applied as $name) {
        echo "  ✔ {$name}\n";
    }
    echo "Pendientes (" . count($pending) . "):\n";
    foreach ($pending as $name) {
        echo "  • {$name}\n";
    }
    exit(0);
}

if ($pending === []) {
    echo "No hay migraciones pendientes.\n";
    exit(0);
}

$dryRun = in_array('--dry-run', $options, true);
$insert = $pdo->prepare('INSERT INTO migrations (migration) VALUES (:migration)');

foreach ($pending as $file) {
    if ($dryRun) {
        echo "  • (dry-run) {$file}\n";
        continue;
    }
    runFile($pdo, $migrationsDir . '/' . $file);
    $insert->execute(['migration' => $file]);
    echo "  ✔ {$file}\n";
}

echo $dryRun ? "Dry-run terminado.\n" : "Migraciones aplicadas: " . count($pending) . "\n";

// ---------------------------------------------------------------- helpers

function loadEnv(string $path): array
{
    if (!is_file($path)) {
        fail("No existe {$path}. Copia .env.example a .env y ajusta los valores.");
    }
    $vars = [];
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $vars[$key] = trim($value, "\"'");
    }
    return $vars;
}

function connect(array $env, ?string $dbName): PDO
{
    $host = $env['DB_HOST'] ?? '127.0.0.1';
    $port = $env['DB_PORT'] ?? '3306';
    $charset = $env['DB_CHARSET'] ?? 'utf8mb4';
    $dsn = "mysql:host={$host};port={$port};charset={$charset}" . ($dbName ? ";dbname={$dbName}" : '');
    try {
        return new PDO($dsn, $env['DB_USERNAME'] ?? 'root', $env['DB_PASSWORD'] ?? '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        fail('No se pudo conectar a MySQL: ' . $e->getMessage());
    }
}

function sqlFiles(string $dir): array
{
    if (!is_dir($dir)) {
        return [];
    }
    $files = array_filter(
        scandir($dir),
        static fn (string $f): bool => (bool) preg_match('/^\d{3}_[a-z0-9_]+\.sql$/', $f)
    );
    sort($files, SORT_STRING);
    return array_values($files);
}

function runFile(PDO $pdo, string $path): void
{
    $sql = trim((string) file_get_contents($path));
    if ($sql === '') {
        fail('Archivo vacío: ' . basename($path));
    }
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        fail('Error en ' . basename($path) . ': ' . $e->getMessage());
    }
}

function fail(string $message): never
{
    fwrite(STDERR, "✖ {$message}\n");
    exit(1);
}
