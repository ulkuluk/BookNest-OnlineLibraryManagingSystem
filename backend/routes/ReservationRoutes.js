import express from 'express';
import {
    getReservations,
    getReservationsByEmail,
    addReservation,
    confirmReservation,
    deleteReservation,
    cancelReservation
} from '../controllers/ReservationController.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { allowRoles } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.post("/add-reservation", verifyToken, addReservation);
router.get("/reservations", verifyToken, allowRoles("admin"), getReservations);
router.get("/reservations/:email", verifyToken, getReservationsByEmail);
router.put("/confirm-reservation/:id", verifyToken, allowRoles("admin"), confirmReservation);
router.put("/cancel-reservation/:id", verifyToken, allowRoles("admin"), cancelReservation);
router.delete("/delete-reservation/:id", allowRoles("admin"), deleteReservation);

export default router;