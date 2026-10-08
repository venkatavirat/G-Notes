const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

router.get("/db-stats", async (req, res) => {
    try {
        const [stats] = await Note.aggregate([
            {
                $facet: {
                    bySemester: [
                        {
                            $group: {
                                _id: "$semester",
                                totalNotes: { $sum: 1 },
                                oldestNote: { $min: "$createdAt" },
                                latestNote: { $max: "$createdAt" }
                            }
                        },
                        { $sort: { _id: 1 } },
                        { $project: { _id: 0, semester: "$_id", totalNotes: 1, oldestNote: 1, latestNote: 1 } }
                    ],
                    count: [{ $count: "totalNotes" }],
                    totals: [
                        {
                            $group: {
                                _id: null,
                                semesterSum: { $sum: "$semester" },
                                averageSemester: { $avg: "$semester" },
                                minSemester: { $min: "$semester" },
                                maxSemester: { $max: "$semester" }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    bySemester: 1,
                    totalNotes: { $ifNull: [{ $arrayElemAt: ["$count.totalNotes", 0] }, 0] },
                    semesterSum: { $ifNull: [{ $arrayElemAt: ["$totals.semesterSum", 0] }, 0] },
                    averageSemester: { $ifNull: [{ $arrayElemAt: ["$totals.averageSemester", 0] }, null] },
                    minSemester: { $ifNull: [{ $arrayElemAt: ["$totals.minSemester", 0] }, null] },
                    maxSemester: { $ifNull: [{ $arrayElemAt: ["$totals.maxSemester", 0] }, null] }
                }
            }
        ]);

        res.json(stats || {
            bySemester: [],
            totalNotes: 0,
            semesterSum: 0,
            averageSemester: null,
            minSemester: null,
            maxSemester: null
        });
    } catch (error) {
        console.error("Database stats aggregation error:", error);
        res.status(500).json({ message: "Failed to calculate database statistics." });
    }
});

router.get("/summary", async (req, res) => {
    try {
        const [result] = await Note.aggregate([
            {
                $facet: {
                    bySemester: [
                        { $group: { _id: "$semester", totalNotes: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                        { $project: { _id: 0, semester: "$_id", totalNotes: 1 } }
                    ],
                    count: [{ $count: "totalNotes" }],
                    overall: [
                        {
                            $group: {
                                _id: null,
                                avgSemester: { $avg: "$semester" },
                                minSemester: { $min: "$semester" },
                                maxSemester: { $max: "$semester" },
                                avgCreatedAtMs: { $avg: { $toLong: "$createdAt" } },
                                earliestCreatedAt: { $min: "$createdAt" },
                                latestCreatedAt: { $max: "$createdAt" }
                            }
                        }
                    ]
                }
            }
        ]);

        const overall = result.overall[0];
        res.json({
            bySemester: result.bySemester,
            overall: {
                totalNotes: result.count[0]?.totalNotes ?? 0,
                avgSemester: overall?.avgSemester ?? null,
                minSemester: overall?.minSemester ?? null,
                maxSemester: overall?.maxSemester ?? null,
                avgCreatedAt: overall?.avgCreatedAtMs == null
                    ? null
                    : new Date(overall.avgCreatedAtMs),
                earliestCreatedAt: overall?.earliestCreatedAt ?? null,
                latestCreatedAt: overall?.latestCreatedAt ?? null
            }
        });
    } catch (error) {
        console.error("Analytics aggregation error:", error);
        res.status(500).json({ message: "Failed to calculate note analytics." });
    }
});

module.exports = router;
