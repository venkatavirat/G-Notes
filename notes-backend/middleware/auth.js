const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const authorization = req.headers.authorization;
    const match = typeof authorization === "string"
        ? authorization.trim().match(/^Bearer\s+(\S+)$/i)
        : null;
    const token = match?.[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");
        return res.status(500).json({ message: "Authentication is unavailable." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload || typeof payload === "string" || typeof payload.id !== "string") {
            return res.status(401).json({ message: "Invalid authentication token." });
        }

        req.user = {
            ...payload,
            id: payload.id,
            _id: payload.id,
            role: payload.role === "admin" ? "admin" : "student"
        };
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired authentication token." });
    }
}

module.exports = authenticate;
