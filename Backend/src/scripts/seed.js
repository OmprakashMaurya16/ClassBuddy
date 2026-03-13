require("dotenv").config({ quiet: true });
const connectDB = require("../config/db.js");
const User = require("../models/user.model.js");

const seedAdmin = async () => {
  await connectDB();

  const email = "admin.vidyalankar@vit.edu.in";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  await User.create({
    fullName: "Vidyalankar Admin",
    email,
    password: "@Admin#Vit",
    role: "Admin",
  });

  console.log("Admin created successfully:", email);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
