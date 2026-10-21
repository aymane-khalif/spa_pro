<?php

// Bootstrap local configuration without replacing an existing environment or key.
$root = dirname(__DIR__);
$environment = $root.'/.env';
if (!file_exists($environment) && !copy($root.'/.env.example', $environment)) {
    fwrite(STDERR, "Unable to create .env.\n");
    exit(1);
}
$contents = file_get_contents($environment);
preg_match('/^APP_KEY=(.*)$/m', $contents, $matches);
if (trim($matches[1] ?? '', " \t\r\n\"'" ) === '') {
    passthru(escapeshellarg(PHP_BINARY).' '.escapeshellarg($root.'/artisan').' key:generate --ansi', $status);
    exit($status);
}
echo "Existing .env and application key preserved.\n";
