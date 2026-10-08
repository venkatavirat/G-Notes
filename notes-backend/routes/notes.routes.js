const express = require("express");
const path = require("node:path");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const Note = require("../models/Note");
const authenticate = require("../middleware/auth");
const upload = require("../middleware/noteUpload");
const validateSemester = require("../middleware/validateSemester");
const uploadNoteFile = require("../services/cloudinaryUpload");

const router = express.Router();

const fileTypes = new Map([
    [".pdf", "application/pdf"],
    [".ppt", "application/vnd.ms-powerpoint"],
    [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
]);

const supportedFileTypes = new Set([".pdf", ".ppt", ".pptx"]);

function isCloudinaryUrl(url) {
    return url.protocol === "https:"
        && (
            url.hostname === "cloudinary.com"
            || url.hostname.endsWith(".cloudinary.com")
            || url.hostname === "cloudinary.net"
            || url.hostname.endsWith(".cloudinary.net")
        );
}

async function fetchCloudinaryAsset(assetUrl) {
    let currentUrl = assetUrl;

    for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
        const response = await fetch(currentUrl, { redirect: "manual" });
        if (![301, 302, 303, 307, 308].includes(response.status)) {
            return response;
        }

        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location || redirectCount === 5) {
            throw new Error("Cloudinary returned an invalid or excessive redirect.");
        }

        currentUrl = new URL(location, currentUrl);
        if (!isCloudinaryUrl(currentUrl)) {
            throw new Error("Cloudinary redirected the file outside its trusted domains.");
        }
    }

    throw new Error("Cloudinary returned an excessive number of redirects.");
}

function noteAccessFilter(id, user) {
    return user.role === "admin" ? { _id: id } : { _id: id, uploadedBy: user.id };
}

router.get("/", async (req, res) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = escapedSearch
            ? {
                $or: ["title", "subjectName", "fileName"].map((field) => ({
                    [field]: { $regex: escapedSearch, $options: "i" }
                }))
            }
            : {};
        const notes = await Note.find(filter)
            .populate({ path: "uploadedBy", select: "name email" })
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function fetchDetailedNotes(req, res) {
    try {
        const notes = await Note.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "uploadedBy",
                    foreignField: "_id",
                    as: "uploader"
                }
            },
            { $unwind: { path: "$uploader", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    title: 1,
                    subjectName: 1,
                    subjectCode: 1,
                    semester: 1,
                    fileType: 1,
                    fileUrl: 1,
                    fileName: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    uploadedBy: {
                        $cond: [
                            { $ifNull: ["$uploader._id", false] },
                            { _id: "$uploader._id", name: "$uploader.name", email: "$uploader.email" },
                            null
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(notes);
    } catch (error) {
        console.error("Detailed notes aggregation error:", error);
        res.status(500).json({ message: "Failed to fetch detailed notes." });
    }
}

router.get("/detailed", fetchDetailedNotes);
router.get("/detailed-join", fetchDetailedNotes);

router.get("/:id/download", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).select("title fileName fileUrl fileType");
        if (!note) {
            return res.status(404).json({
                message: "Note not found in local database. Please upload a new note."
            });
        }

        const extension = note.fileName?.slice(note.fileName.lastIndexOf(".")).toLowerCase();
        const extensionFromType = note.fileType ? `.${note.fileType}` : "";
        const fileExtension = supportedFileTypes.has(extension) ? extension : extensionFromType;
        const contentType = fileTypes.get(fileExtension);
        if (!contentType || !note.fileUrl) {
            return res.status(400).json({ message: "This note does not have a downloadable supported file." });
        }

        const assetUrl = new URL(note.fileUrl);
        if (!isCloudinaryUrl(assetUrl)) {
            console.error("Refusing to proxy a non-Cloudinary note URL.", { noteId: note.id });
            return res.status(502).json({ message: "The stored file URL is unavailable." });
        }

        const upstream = await fetchCloudinaryAsset(assetUrl);
        if (!upstream.ok || !upstream.body) {
            console.error("Cloudinary download failed.", {
                noteId: note.id,
                status: upstream.status
            });
            return res.status(502).json({ message: "Unable to retrieve the note file." });
        }

        const safeTitle = (note.title || "note").replace(/[\\/:*?"<>|\r\n]/g, "_").trim() || "note";
        const downloadName = `${safeTitle}${fileExtension}`;
        const asciiName = downloadName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
        res.setHeader("Content-Type", contentType);
        res.setHeader(
            "Content-Disposition",
            `${req.query.download === "true" ? "attachment" : "inline"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`
        );
        res.setHeader("X-Content-Type-Options", "nosniff");

        await pipeline(Readable.fromWeb(upstream.body), res);
        return undefined;
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                message: "Note not found in local database. Please upload a new note."
            });
        }
        console.error("Note download error:", error);
        if (res.headersSent) {
            res.destroy(error);
            return undefined;
        }
        return res.status(502).json({ message: "Unable to download the note file." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate({ path: "uploadedBy", select: "name email" });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json(note);
    } catch (error) {
        res.status(error.name === "CastError" ? 400 : 500).json({ message: error.message });
    }
});

router.post("/", authenticate, upload.single("file"), validateSemester({ required: true }), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "A file is required." });
        }

        const { title } = req.body;
        const subjectName = req.body.subjectName || req.body.subjectCode || "";
        const result = await uploadNoteFile(req.file.buffer, req.file.originalname);
        const note = await Note.create({
            title: typeof title === "string" ? title.trim() : title,
            subjectName,
            subjectCode: req.body.subjectCode || "",
            semester: req.validatedSemester,
            fileType: path.extname(req.file.originalname).slice(1).toLowerCase(),
            fileUrl: result.secure_url,
            fileName: req.file.originalname,
            uploadedBy: req.user._id,
        });

        await note.populate({ path: "uploadedBy", select: "name email" });
        res.status(201).json(note);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500)
            .json({ message: error.message });
    }
});

// DELETE: Delete note by ID
router.delete("/:id", authenticate, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    try {
        const accessFilter = noteAccessFilter(req.params.id, req.user);
        const deletedNote = await Note.findOneAndDelete(accessFilter);
        if (!deletedNote) {
            const exists = await Note.exists({ _id: req.params.id });
            return res.status(exists ? 403 : 404).json({
                message: exists ? "You can only delete notes you uploaded." : "Note not found"
            });
        }
        res.json({ message: "Note deleted successfully", id: deletedNote._id });
    } catch (error) {
        res.status(error.name === "CastError" ? 400 : 500).json({ message: error.message });
    }
});

// PUT: Update note metadata and optionally replace its file.
router.put("/:id", authenticate, upload.single("file"), validateSemester(), async (req, res) => {
    try {
        const updateData = {};
        if (req.body.title !== undefined) {
            updateData.title = typeof req.body.title === "string" ? req.body.title.trim() : req.body.title;
        }
        if (req.body.subjectName !== undefined) updateData.subjectName = req.body.subjectName.trim();
        if (req.body.subjectCode !== undefined) updateData.subjectCode = req.body.subjectCode.trim();
        if (req.validatedSemester !== undefined) updateData.semester = req.validatedSemester;

        if (req.file) {
            const result = await uploadNoteFile(req.file.buffer, req.file.originalname);
            updateData.fileUrl = result.secure_url;
            updateData.fileName = req.file.originalname;
            updateData.fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No note changes were provided." });
        }

        const updatedNote = await Note.findOneAndUpdate(
            noteAccessFilter(req.params.id, req.user),
            updateData,
            { new: true, runValidators: true }
        ).populate({ path: "uploadedBy", select: "name email" });

        if (!updatedNote) {
            const exists = await Note.exists({ _id: req.params.id });
            return res.status(exists ? 403 : 404).json({
                message: exists ? "You can only update notes you uploaded." : "Note not found"
            });
        }

        res.json(updatedNote);
    } catch (error) {
        res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500)
            .json({ message: error.message });
    }
});

module.exports = router;