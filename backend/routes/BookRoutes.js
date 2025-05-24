import express from 'express';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getBookById,
  getBookByIsbn,
} from '../controllers/BookController.js';
import { allowRoles } from "../middleware/RoleMiddleware.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

//endpoint data biasa
router.post("/add-book", verifyToken, allowRoles("admin"), addBook); 
router.get("/books",  getBooks);
router.get("/book/:id", getBookById);
router.get("/book/:isbn", getBookByIsbn);
router.put("/update-book/:id", verifyToken, allowRoles("admin"), updateBook);
router.delete("/delete-book/:id", verifyToken, allowRoles("admin"), deleteBook);

export default router;