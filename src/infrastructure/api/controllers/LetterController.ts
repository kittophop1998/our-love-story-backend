import { Request, Response } from "express";
import { ResponseUtil } from "../utils/Response";
import { CreateLetterRequest, LetterService } from "../../../application/services/LetterService";

export class LetterController {
    constructor(
        private letterService: LetterService
    ) { }

    async createLetter(req: Request, res: Response) {
        try {
            const requestData: CreateLetterRequest = req.body;

            if (!requestData.title || !requestData.message) {
                ResponseUtil.error(res, 'Title and message are required', 400);
            }

            const result = await this.letterService.createLetter(requestData);
            
            ResponseUtil.success(res, result, 'Create letter successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Create letter failed', 500, error.message);
        }
    }

    async uploadAttachment(req: Request, res: Response) {
        try {
            if (!req.file) {
                ResponseUtil.error(res, 'No file uploaded', 400);
                return;
            }

            const result = await this.letterService.uploadAttachment(req.file);
            
            ResponseUtil.success(res, result, 'Upload attachment successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Upload attachment failed', 500, error.message);
        }
    }

    async getLetterByPublicId(req: Request, res: Response) {
        try {
            const publicId = req.params.publicId.toString();
            const letter = await this.letterService.getLetterByPublicId(publicId);
            if (!letter) {
                ResponseUtil.error(res, 'Letter not found', 404);
                return;
            }
            ResponseUtil.success(res, letter, 'Get letter successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Get letter failed', 500, error.message);
        }
    }

    async getLetterByEditTokenHash(req: Request, res: Response) {
        try {
            const editTokenHash = req.params.editTokenHash.toString();
            const letter = await this.letterService.getLetterByEditTokenHash(editTokenHash);
            if (!letter) {
                ResponseUtil.error(res, 'Letter not found', 404);
                return;
            }
            ResponseUtil.success(res, letter, 'Get letter successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Get letter failed', 500, error.message);
        }
    }
}