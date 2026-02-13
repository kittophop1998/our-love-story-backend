import { Response } from "express";

export class ResponseUtil {
    static success(
        res: Response, 
        data: any,
        message: string = 'Success', 
        statusCode: number = 200
    ) {
        const response = {
            success: true,
            message: message || 'Operation successful',
            data,
            timestamp: new Date().toISOString(),
        };

        return res.status(statusCode).json(response);
    }

    static error(
        res: Response, 
        message: string = 'Error', 
        statusCode: number = 500, 
        errorDetails?: any
    ) {
        const response: any = {
            success: false,
            message: message || 'An error occurred',
            timestamp: new Date().toISOString(),
        };

        if (errorDetails) {
            response.error = errorDetails;
        }

        return res.status(statusCode).json(response);
    }
}