import express from "express";
import { submitContactForm, getContacts, deleteContact } from "../controllers/contactController.js";

const router = express.Router();

// POST /api/contact
router.post("/", submitContactForm);

// GET /api/contact
router.get("/", getContacts);

// DELETE /api/contact/:id
router.delete("/:id", deleteContact);

export default router;
