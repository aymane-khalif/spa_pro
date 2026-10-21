import { existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const environment = fileURLToPath(new URL('../.env', import.meta.url));
if (!existsSync(environment)) {
  copyFileSync(new URL('../.env.example', import.meta.url), environment);
  console.log('Created frontend .env from .env.example.');
}
