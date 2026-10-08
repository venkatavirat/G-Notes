const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100
        },

        subjectName: {
            type: String,
            trim: true,
            default: ""
        },

        subjectCode: {
            type: String,
            trim: true,
            default: ""
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
            validate: {
                validator: Number.isInteger,
                message: "Semester must be an integer from 1 to 8."
            }
        },

        fileType: {
            type: String,
            required: true,
            enum: ["pdf", "ppt", "pptx"]
        },

        fileUrl: {
            type: String,
            required: false,
            default: ""
        },

        fileName: {
            type: String,
            required: false,
            default: ""
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Note", noteSchema);