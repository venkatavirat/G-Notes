const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        subjectCode: {
            type: String,
            required: true
        },

        semester: {
            type: Number,
            required: true
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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Note", noteSchema);