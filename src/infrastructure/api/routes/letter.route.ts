import { Router } from "express";
import { LetterController } from "../controllers/LetterController";
import { LetterService } from "../../../application/services/LetterService";
import { LetterRepository } from "../../database/LetterRepository";
import { upload } from "../utils/Multer";

export function setLetterRoutes() {
    const router = Router();

    const letterRepository = new LetterRepository();
    const letterService = new LetterService(letterRepository);
    const letterController = new LetterController(letterService);

    router.post('/create', (req, res) => letterController.createLetter(req, res));
    router.post('/upload-attachment', upload.single('file'), (req, res) => letterController.uploadAttachment(req, res));
    router.get('/public/:publicId', (req, res) => letterController.getLetterByPublicId(req, res));
    router.get('/edit/:editTokenHash', (req, res) => letterController.getLetterByEditTokenHash(req, res));

    return router;
}