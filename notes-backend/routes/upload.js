const express = require("express");
const path = require("node:path");
const router = express.Router();
const Note = require("../models/Note");
const authenticate = require("../middleware/auth");
const upload = require("../middleware/noteUpload");
const validateSemester = require("../middleware/validateSemester");
const uploadNoteFile = require("../services/cloudinaryUpload");

function noteAccessFilter(id, user) {
  return user.role === "admin" ? { _id: id } : { _id: id, uploadedBy: user.id };
}

// ==========================================
// 1. GET: Fetch all notes (or filter by query)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find()
      .populate({ path: "uploadedBy", select: "name email" })
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Fetch notes error:", error);
    res.status(500).json({ message: "Failed to fetch notes." });
  }
});

// ==========================================
// 2. GET: Fetch a single note by ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Fetch single note error:", error);
    res.status(500).json({ message: "Failed to fetch note." });
  }
});

// ==========================================
// 3. POST: Upload a new note with file
// ==========================================
router.post("/", authenticate, upload.single("file"), validateSemester({ required: true }), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { title } = req.body;
    const subjectName = req.body.subjectName || req.body.subjectCode || "";
    const cloudinaryResult = await uploadNoteFile(req.file.buffer, req.file.originalname);

    const note = await Note.create({
      title: typeof title === "string" ? title.trim() : title,
      subjectName,
      subjectCode: req.body.subjectCode || "",
      semester: req.validatedSemester,
      fileType: path.extname(req.file.originalname).slice(1).toLowerCase(),
      fileUrl: cloudinaryResult.secure_url,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
    });

    await note.populate({ path: "uploadedBy", select: "name email" });
    res.status(201).json({
      message: "Note uploaded successfully!",
      note,
    });
  } catch (error) {
    console.error("Upload error details:", error);
    const status = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: error.message || "File upload failed." });
  }
});

// ==========================================
// 4. PUT: Update an existing note (metadata / optional new file)
// ==========================================
router.put("/:id", authenticate, upload.single("file"), validateSemester(), async (req, res) => {
  try {
    const updateData = {};
    if (req.body.title !== undefined) {
      updateData.title = typeof req.body.title === "string" ? req.body.title.trim() : req.body.title;
    }
    if (req.body.subjectName !== undefined) updateData.subjectName = req.body.subjectName.trim();
    if (req.body.subjectCode !== undefined) updateData.subjectCode = req.body.subjectCode.trim();
    if (req.validatedSemester !== undefined) updateData.semester = req.validatedSemester;

    // If a new file is attached during update, upload it to Cloudinary
    if (req.file) {
      const cloudinaryResult = await uploadNoteFile(req.file.buffer, req.file.originalname);
      updateData.fileUrl = cloudinaryResult.secure_url;
      updateData.fileName = req.file.originalname;
      updateData.fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
    }

    const updatedNote = await Note.findOneAndUpdate(
      noteAccessFilter(req.params.id, req.user),
      updateData,
      { new: true, runValidators: true }
    ).populate({ path: "uploadedBy", select: "name email" });

    if (!updatedNote) {
      const exists = await Note.exists({ _id: req.params.id });
      return res.status(exists ? 403 : 404).json({
        message: exists ? "You can only update notes you uploaded." : "Note not found for update."
      });
    }

    res.status(200).json({
      message: "Note updated successfully!",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update error:", error);
    const status = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: status === 400 ? error.message : "Failed to update note." });
  }
});

// ==========================================
// 5. DELETE: Remove a note by ID
// ==========================================
router.delete("/:id", authenticate, async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const deletedNote = await Note.findOneAndDelete(noteAccessFilter(req.params.id, req.user));

    if (!deletedNote) {
      const exists = await Note.exists({ _id: req.params.id });
      return res.status(exists ? 403 : 404).json({
        message: exists ? "You can only delete notes you uploaded." : "Note not found for deletion."
      });
    }

    // Optional: Extract Cloudinary public_id and delete from Cloudinary storage if needed

    res.status(200).json({
      message: "Note deleted successfully!",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Delete error:", error);
    const status = error.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: status === 400 ? "Invalid note ID." : "Failed to delete note." });
  }
});

module.exports = router;