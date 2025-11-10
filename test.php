<?php
// generar_hash.php
// Uso: 
//  - Navegador: http://localhost/25-26-ERRONKA-TALDE3/generar_hash.php?password=a
//  - POST: envía 'password' como campo POST
//  - CLI: php generar_hash.php a

// Modo de salida: texto plano para que sea cómodo ver/usar el hash
header('Content-Type: text/plain; charset=utf-8');

// Obtener la contraseña de entrada (prioridad: CLI > POST > GET)
$password = "a";

// CLI
if (PHP_SAPI === 'cli') {
    if (isset($argc) && $argc > 1) {
        $password = $argv[1];
    }
} else {
    // Web (POST tiene prioridad sobre GET)
    if (!empty($_POST['password'])) {
        $password = $_POST['password'];
    } elseif (!empty($_GET['password'])) {
        $password = $_GET['password'];
    }
}

// Validación básica
if ($password === null || $password === '') {
    echo "Error: no se ha recibido ninguna contraseña.\n";
    echo "Uso:\n";
    echo "  Navegador: /generar_hash.php?password=tu_contraseña\n";
    echo "  CLI: php generar_hash.php tu_contraseña\n";
    exit(1);
}

// Opciones de hashing (cost ajustable si quieres)
$options = ['cost' => 10];

// Generar hash bcrypt
$hash = password_hash($password, PASSWORD_BCRYPT, $options);

// Salida segura (aviso sobre seguridad)
echo "Contraseña recibida (solo para debug): '{$password}'\n";
echo "Hash bcrypt generado:\n{$hash}\n\n";
echo "Nota: no expongas este endpoint en producción ni guardes contraseñas en texto plano.\n";
