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

const router = express.Router();

//endpoint data biasa
router.post("/add-book", allowRoles("admin"), addBook); 
router.get("/books",  getBooks);
router.get("/book/:id", getBookById);
router.get("/book/:isbn", getBookByIsbn);
router.put("/update-book/:id", allowRoles("admin"), updateBook);
router.delete("/delete-book/:id", allowRoles("admin"), deleteBook);

export default router;