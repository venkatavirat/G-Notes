require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Note = require("./models/Note");
const User = require("./models/User");

const MONGO_URI = "mongodb://127.0.0.1:27017/gnotes";
const SAMPLE_PDF_URL = "https://res.cloudinary.com/demo/image/upload/sample.pdf";
const TEST_EMAIL = "testuser@example.com";
const TEST_PASSWORD = "TestUser123!";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to local MongoDB: ${MONGO_URI}`);

    await Note.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing notes and users.");

    const [user] = await User.create([{
      name: "Test User",
      email: TEST_EMAIL,
      password: await bcrypt.hash(TEST_PASSWORD, 10),
      role: "student"
    }]);

    await Note.insertMany([
      {
        title: "Introduction to Algorithms",
        subjectName: "Computer Science",
        subjectCode: "CS101",
        semester: 1,
        fileType: "pdf",
        fileUrl: SAMPLE_PDF_URL,
        fileName: "introduction-to-algorithms.pdf",
        uploadedBy: user._id
      },
      {
        title: "Database Systems Overview",
        subjectName: "Database Management",
        subjectCode: "CS204",
        semester: 4,
        fileType: "pdf",
        fileUrl: SAMPLE_PDF_URL,
        fileName: "database-systems-overview.pdf",
        uploadedBy: user._id
      },
      {
        title: "Software Engineering Notes",
        subjectName: "Software Engineering",
        subjectCode: "CS301",
        semester: 6,
        fileType: "pdf",
        fileUrl: SAMPLE_PDF_URL,
        fileName: "software-engineering-notes.pdf",
        uploadedBy: user._id
      }
    ]);

    console.log("Seeded 1 test user and 3 sample notes.");
    console.log(`Test login: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  } catch (error) {
    console.error("Local MongoDB seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
