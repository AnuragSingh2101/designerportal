const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB, closeDB } = require('../config/db');

const User = require('../models/User');

const seedData = async () => {
  try {
    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminName || !adminEmail || !adminPassword) {
      console.error('Error: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined in the .env file.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Look for an existing admin user
    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      // Update existing admin user
      admin.name = adminName;
      admin.email = adminEmail.toLowerCase();
      admin.passwordHash = passwordHash;
      await admin.save();
      console.log('Admin user updated successfully.');
    } else {
      // Check if a user with that email already exists
      const userExists = await User.findOne({ email: adminEmail.toLowerCase() });
      if (userExists) {
        userExists.role = 'admin';
        userExists.name = adminName;
        userExists.passwordHash = passwordHash;
        await userExists.save();
        console.log('Existing user promoted to Admin and credentials updated.');
      } else {
        // Create new admin
        await User.create({
          name: adminName,
          email: adminEmail.toLowerCase(),
          passwordHash: passwordHash,
          role: 'admin'
        });
        console.log('Admin user created successfully.');
      }
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedData();
    await closeDB();
  });
}

module.exports = seedData;
