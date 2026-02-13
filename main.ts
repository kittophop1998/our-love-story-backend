import { App } from "./src/infrastructure/api/App";

async function main() {
    try {
        const app = new App();
        app.listen();
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

main();