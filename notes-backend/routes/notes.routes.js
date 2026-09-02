const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Note = require("../models/Note");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET: Fetch all notes
router.get("/", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Upload file to Cloudinary & create note in MongoDB
router.post("/", upload.single("file"), async (req, res) => {
    try {
        let fileUrl = "";
        let fileName = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "g-notes",
                resource_type: "auto"
            });
            fileUrl = result.secure_url;
            fileName = req.file.originalname;
        }

        const note = await Note.create({
            title: req.body.title,
            subjectCode: req.body.subjectCode,
            semester: Number(req.body.semester),
            fileUrl,
            fileName
        });

        res.status(201).json(note);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE: Delete note by ID
router.delete("/:id", async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT: Update note metadata by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                subjectCode: req.body.subjectCode,
                semester: req.body.semester
            },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;