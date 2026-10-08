function validateSemester({ required = false } = {}) {
  return (req, res, next) => {
    const rawSemester = req.body?.semester;

    if (rawSemester === undefined && !required) {
      return next();
    }

    const semester = typeof rawSemester === "number"
      ? rawSemester
      : typeof rawSemester === "string" && /^[1-8]$/.test(rawSemester.trim())
        ? Number(rawSemester.trim())
        : Number.NaN;

    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({ message: "Semester must be an integer from 1 to 8." });
    }

    req.validatedSemester = semester;
    return next();
  };
}

module.exports = validateSemester;
