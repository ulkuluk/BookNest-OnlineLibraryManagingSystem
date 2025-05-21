import express from 'express';
import {
    getReviewsByIsbn,
    addReview,
} from '../controllers/ReviewController.js';

const router = express.Router();

router.get("/reviews:isbn", getReviewsByIsbn);
router.post("/add-review", addReview);

export default router;