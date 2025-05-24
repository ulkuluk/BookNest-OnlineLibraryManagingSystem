import express from 'express';
import {
    getReviewsByIsbn,
    addReview,
} from '../controllers/ReviewController.js';
import { verifyToken } from '../middleware/VerifyToken.js';

const router = express.Router();

router.get("/reviews/:isbn", getReviewsByIsbn);
router.post("/add-review",verifyToken, addReview);

export default router;