import { loadEnvFile } from 'node:process'

export function loadEnv() {
    const files = [`.env`].filter((file): file is string => !!file);

    for (const file of files) {
        try {
            loadEnvFile(file);
            break;
        } catch {}
    }
}