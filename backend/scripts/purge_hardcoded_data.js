const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB, closeDB } = require('../config/db');

const User = require('../models/User');
const DesignerProfile = require('../models/DesignerProfile');
const PortfolioProject = require('../models/PortfolioProject');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Report = require('../models/Report');

const hardcodedEmails = [
  'sarah@gmail.com',
  'marcus@yahoo.com',
  'chloe@outlook.com',
  'david@kimcorp.com',
  'sophia@loren.it',
  'james@carterdesign.com',
  'julian@vancedesign.com',
  'amelia@cheninteriors.com',
  'mateo@silvaarch.com',
  'sophie@duboisdesign.co',
  'nikhil@studioneo.in',
  'clara@oswaldpartners.com',
  'brandon@colecreative.com',
  'hannah@abbottarchitecture.com',
  'e.rostova.security.admin@designer-portal.internal'
];

async function purge() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Finding hardcoded users...');
    const users = await User.find({ email: { $in: hardcodedEmails } });
    const userIds = users.map(u => u._id);
    console.log(`Found ${users.length} users to delete.`);

    if (users.length === 0) {
      console.log('No hardcoded users found. Database is already clean.');
      await closeDB();
      return;
    }

    console.log('Finding designer profiles...');
    const designerProfiles = await DesignerProfile.find({ userId: { $in: userIds } });
    const designerProfileIds = designerProfiles.map(dp => dp._id);
    console.log(`Found ${designerProfiles.length} designer profiles to delete.`);

    console.log('Finding portfolio projects...');
    const projects = await PortfolioProject.find({ designerId: { $in: designerProfileIds } });
    const projectIds = projects.map(p => p._id);
    console.log(`Found ${projects.length} projects to delete.`);

    // Deleting associated records
    console.log('Deleting portfolio projects...');
    const delProjects = await PortfolioProject.deleteMany({ _id: { $in: projectIds } });
    console.log(`Deleted ${delProjects.deletedCount} projects.`);

    console.log('Deleting inquiries...');
    const delInquiries = await Inquiry.deleteMany({
      $or: [
        { clientId: { $in: userIds } },
        { designerId: { $in: designerProfileIds } }
      ]
    });
    console.log(`Deleted ${delInquiries.deletedCount} inquiries.`);

    console.log('Deleting reviews...');
    const delReviews = await Review.deleteMany({
      $or: [
        { clientId: { $in: userIds } },
        { designerId: { $in: designerProfileIds } }
      ]
    });
    console.log(`Deleted ${delReviews.deletedCount} reviews.`);

    console.log('Deleting moderation reports...');
    const delReports = await Report.deleteMany({
      $or: [
        { reportedBy: { $in: userIds } },
        { targetId: { $in: [...userIds, ...designerProfileIds, ...projectIds] } }
      ]
    });
    console.log(`Deleted ${delReports.deletedCount} reports.`);

    console.log('Deleting designer profiles...');
    const delProfiles = await DesignerProfile.deleteMany({ _id: { $in: designerProfileIds } });
    console.log(`Deleted ${delProfiles.deletedCount} designer profiles.`);

    console.log('Deleting users...');
    const delUsers = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`Deleted ${delUsers.deletedCount} users.`);

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during purge:', error);
  } finally {
    await closeDB();
  }
}

purge();
