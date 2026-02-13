import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from '../config';
import { router } from './routes';

export class App {
    private app: Express;

    constructor() {
        this.app = express();
        this.setupMiddlewares();
        this.setupRoutes();
    }

    private setupMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        const allowedOrigins = [
            'http://localhost:3000',
            'https://our-love-story.up.railway.app',
        ];

        this.app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
            exposedHeaders: ['Set-Cookie']
        }));
    };

    private setupRoutes() {
        this.app.get('/health', (_: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'Server is healthy',
                timestamp: new Date().toISOString()
            });
        });

        // API routes
        this.app.use('/api/v1', router);

        // 404 handler
        this.app.use((_: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`🚀 Server is running on port ${config.port}`);
            console.log(`📍 Health check: http://localhost:${config.port}/health`);
            console.log(`📍 API endpoint: http://localhost:${config.port}/api/v1`);
        });
    }

    public getApp(): Express {
        return this.app;
    }
}