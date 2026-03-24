require("dotenv").config({ quiet: true });
const connectDB = require("../config/db.js");
const User = require("../models/user.model.js");

const DEPARTMENTS = ["INFT", "CMPN", "EXTC", "EXCS", "BIOMED", "FE"];
const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
];

const DUMMY_PASSWORD = "12345678";

const buildFacultySeedData = () => {
  const faculty = [];

  for (const department of DEPARTMENTS) {
    for (let index = 1; index <= 4; index += 1) {
      const serial = String(index).padStart(2, "0");
      faculty.push({
        fullName: `${department} Faculty ${index}`,
        email: `${department.toLowerCase()}.faculty${serial}@vit.edu.in`,
        password: DUMMY_PASSWORD,
        role: "Faculty",
        department,
        designation: DESIGNATIONS[index - 1],
        subjects: [],
      });
    }
  }

  return faculty;
};

const seed = async () => {
  await connectDB();

  const adminEmail = "admin.vidyalankar@vit.edu.in";
  let createdAdmin = false;

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      fullName: "Vidyalankar Admin",
      email: adminEmail,
      password: "@Admin#Vit",
      role: "Admin",
    });
    createdAdmin = true;
  }

  const facultyData = buildFacultySeedData();
  const emails = facultyData.map((item) => item.email);
  const existingFaculty = await User.find({ email: { $in: emails } }).select(
    "email",
  );

  const existingEmailSet = new Set(existingFaculty.map((item) => item.email));
  const newFaculty = facultyData.filter(
    (item) => !existingEmailSet.has(item.email),
  );

  if (newFaculty.length > 0) {
    await User.insertMany(newFaculty);
  }

  console.log("Seeding completed successfully.");
  console.log(createdAdmin ? "Admin created." : "Admin already exists.");
  console.log(`Faculty created: ${newFaculty.length}`);
  console.log(
    `Faculty already present: ${facultyData.length - newFaculty.length}`,
  );

  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
