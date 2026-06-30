const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB, closeDB } = require('../config/db');

// Models
const User = require('../models/User');
const DesignerProfile = require('../models/DesignerProfile');
const PortfolioProject = require('../models/PortfolioProject');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    // 1. Clean existing database collections
    await User.deleteMany({});
    await DesignerProfile.deleteMany({});
    await PortfolioProject.deleteMany({});
    await Inquiry.deleteMany({});
    await Review.deleteMany({});
    await Report.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const adminEmail = process.env.ADMIN_EMAIL || 'e.rostova.security.admin@designer-portal.internal';
    const adminPassword = process.env.ADMIN_PASSWORD || 'K3p!9$wQ#7mZt5&vY1xR2';
    const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

    // 2. Create Admin
    const admin = await User.create({
      name: 'Elena Rostova',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin'
    });
    console.log('Admin user created.');

    // 3. Create Clients
    console.log('Creating Clients...');
    const clientData = [
      { name: 'Sarah Jenkins', email: 'sarah@gmail.com' },
      { name: 'Marcus Aurelius', email: 'marcus@yahoo.com' },
      { name: 'Chloe Vance', email: 'chloe@outlook.com' },
      { name: 'David Kim', email: 'david@kimcorp.com' },
      { name: 'Sophia Loren', email: 'sophia@loren.it' },
      { name: 'James Carter', email: 'james@carterdesign.com' }
    ];

    const clients = [];
    for (let c of clientData) {
      const user = await User.create({
        name: c.name,
        email: c.email,
        passwordHash,
        role: 'client'
      });
      clients.push(user);
    }
    console.log(`${clients.length} clients created.`);

    // 4. Create Designers
    console.log('Creating Designers...');
    const designerUsersData = [
      { name: 'Julian Vance', email: 'julian@vancedesign.com', location: 'San Francisco, CA', expertise: ['architecture', 'interior_design'], experience: 12, budgetMin: 50000, budgetMax: 500000, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Award-winning architect and spatial designer. Julian specializes in structural transparency, blending raw concrete with organic timber to design modern residential spaces.' },
      { name: 'Amelia Chen', email: 'amelia@cheninteriors.com', location: 'New York, NY', expertise: ['interior_design'], experience: 8, budgetMin: 15000, budgetMax: 150000, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', bio: 'Amelia brings a warm, minimalist approach (Japandi) to Manhattan residential lofts. She focuses on custom millwork, soft textures, and sustainable natural materials.' },
      { name: 'Mateo Silva', email: 'mateo@silvaarch.com', location: 'Austin, TX', expertise: ['architecture'], experience: 15, budgetMin: 100000, budgetMax: 1000000, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', bio: 'Specializing in high-end desert modern residential properties. Mateo crafts net-zero homes that harmonize with local landscape topographies.' },
      { name: 'Sophie Dubois', email: 'sophie@duboisdesign.co', location: 'Miami, FL', expertise: ['architecture', 'interior_design'], experience: 10, budgetMin: 40000, budgetMax: 400000, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', bio: 'Sophie combines classical French proportions with tropical modernism. Her designs offer expansive outdoor-indoor integrations and bespoke furnishings.' },
      { name: 'Nikhil Mehta', email: 'nikhil@studioneo.in', location: 'Chicago, IL', expertise: ['interior_design'], experience: 6, budgetMin: 10000, budgetMax: 80000, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', bio: 'Nikhil focuses on adaptive reuse, converting post-industrial spaces into modern offices and residential lofts using recycled steel and rich leathers.' },
      { name: 'Clara Oswald', email: 'clara@oswaldpartners.com', location: 'Seattle, WA', expertise: ['architecture'], experience: 9, budgetMin: 75000, budgetMax: 600000, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', bio: 'Specialist in Pacific Northwest contemporary architecture. Clara integrates heavy timber framing and rain-screen cladding with energy-efficient smart building tech.' },
      { name: 'Brandon Cole', email: 'brandon@colecreative.com', location: 'Los Angeles, CA', expertise: ['interior_design'], experience: 11, budgetMin: 20000, budgetMax: 200000, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80', bio: 'Mid-century modernist enthusiast designing tailored residential and commercial hospitality environments. Brandon emphasizes vibrant accent tones and custom lighting design.' },
      { name: 'Hannah Abbott', email: 'hannah@abbottarchitecture.com', location: 'Boston, MA', expertise: ['architecture', 'interior_design'], experience: 7, budgetMin: 30000, budgetMax: 300000, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', bio: ' Hannah focuses on historical preservation and transitional style, restoring 19th-century brownstones while introducing modern kitchen layouts and state-of-the-art structural expansions.' }
    ];

    const designers = [];
    for (let d of designerUsersData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        passwordHash,
        role: 'designer'
      });

      const profile = await DesignerProfile.create({
        userId: user._id,
        expertise: d.expertise,
        experienceYears: d.experience,
        location: d.location,
        budgetMin: d.budgetMin,
        budgetMax: d.budgetMax,
        bio: d.bio,
        profilePhotoUrl: d.photo,
        avgRating: 0 // Will recalculate later
      });
      designers.push(profile);
    }
    console.log(`${designers.length} designers created.`);

    // 5. Create Portfolio Projects
    console.log('Creating Portfolio Projects...');
    const projectTemplates = [
      {
        title: 'Glass & Cedar Residence',
        description: 'A 4,500 sq ft custom home emphasizing local Western Red Cedar cladding and structural glass columns, designed to overlook the coastal tree line.',
        style: 'Minimalist',
        category: 'Residential',
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
        ]
      },
      {
        title: 'Japandi Living Room Restyling',
        description: 'A full interior layout transformation focusing on low-profile oak furniture, warm textured limewash paint, and handmade ceramics.',
        style: 'Japandi',
        category: 'Renovation',
        images: [
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'
        ]
      },
      {
        title: 'The Steel Beam Industrial Workspace',
        description: 'An adaptive reuse commercial headquarters featuring exposed structural steel, polished concrete floors, and custom acoustic moss screens.',
        style: 'Industrial',
        category: 'Commercial',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
          'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80'
        ]
      },
      {
        title: 'Coastal Modern Condo',
        description: 'A beachfront apartment with natural linen textures, travertine floors, and floor-to-ceiling glass panel sliding doors facing the ocean.',
        style: 'Coastal',
        category: 'Residential',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80'
        ]
      },
      {
        title: 'Transitional Style Brownstone Kitchen',
        description: 'Merging historical panel details with custom modern marble countertops, deep navy blue cabinets, and premium integrated brass appliances.',
        style: 'Transitional',
        category: 'Renovation',
        images: [
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80'
        ]
      }
    ];

    // Seed 3 projects per designer
    for (let designer of designers) {
      const user = await User.findById(designer.userId);
      const designerName = user ? user.name : 'Designer';
      for (let i = 0; i < 3; i++) {
        // Grab template and randomize order slightly
        const template = projectTemplates[(designers.indexOf(designer) + i) % projectTemplates.length];
        
        await PortfolioProject.create({
          designerId: designer._id,
          title: `${designerName}'s ${template.title}`,
          description: template.description,
          style: template.style,
          category: template.category,
          images: template.images
        });
      }
    }
    console.log('Portfolio projects seeded.');

    // 6. Create Inquiries (Clients to Designers)
    console.log('Creating Inquiries...');
    // We will seed 9 inquiries to establish history
    const inquiryData = [
      // 1. Client Sarah -> Designer Julian (Closed - reviewed)
      { clientIndex: 0, designerIndex: 0, budget: 150000, req: 'Full home renovation for 3-bedroom mid-century house in San Francisco.', msg: 'Hello Julian, I love your cedar wood structures. Can we talk about a structural renovation starting this fall?', status: 'closed', responses: [
        { senderRole: 'designer', message: 'Hello Sarah, I would love to look at your layout! I have open capacity starting in September. Do you have existing blue prints?' },
        { senderRole: 'client', message: 'Yes, I have PDF blueprints. I will send them via email. Thank you!' }
      ] },
      // 2. Client Marcus -> Designer Julian (Responded - reviewed)
      { clientIndex: 1, designerIndex: 0, budget: 85000, req: 'Open-concept kitchen and living room reconstruction with custom oak partitions.', msg: 'Hi Julian, we would love to incorporate your glass column concepts into our living room space.', status: 'responded', responses: [
        { senderRole: 'designer', message: 'Hi Marcus, thank you for reaching out. Yes, that concept fits well with open partitions. Let’s schedule a preliminary video call.' }
      ] },
      // 3. Client Chloe -> Designer Amelia (Closed - reviewed)
      { clientIndex: 2, designerIndex: 1, budget: 35000, req: 'Japandi styled apartment decoration in downtown Manhattan.', msg: 'Dear Amelia, I love your minimal style. Can we work together to refurbish our 2-bedroom rental apartment?', status: 'closed', responses: [
        { senderRole: 'designer', message: 'Hello Chloe! I specialize in high-impact rental improvements using custom lighting and organic textiles. Let’s connect!' }
      ] },
      // 4. Client David -> Designer Mateo (Responded)
      { clientIndex: 3, designerIndex: 2, budget: 750000, req: 'Custom sustainable desert retreat on 5 acres in West Austin.', msg: 'Hello Mateo, we have acquired land near Lake Travis and want to build a modern solar-powered villa.', status: 'responded', responses: [
        { senderRole: 'designer', message: 'David, congratulations on the plot! Building net-zero on Lake Travis is a wonderful project. I will review the location mapping details.' }
      ] },
      // 5. Client Sophia -> Designer Sophie (Pending)
      { clientIndex: 4, designerIndex: 3, budget: 200000, req: 'Waterfront condo interior redesign incorporating outdoor patio and custom kitchen island.', msg: 'Hi Sophie, we need a designer to merge our French antiques with a modern Florida interior style.', status: 'pending', responses: [] },
      // 6. Client James -> Designer Nikhil (Closed - reviewed)
      { clientIndex: 5, designerIndex: 4, budget: 60000, req: 'Converted brick-and-beam commercial loft design for creative studio office.', msg: 'Hey Nikhil, saw your work on adaptive reuse lofts. We want to convert our new lease in West Loop into a workspace.', status: 'closed', responses: [
        { senderRole: 'designer', message: 'Hi James, that West Loop space has gorgeous bones. We should keep the original red bricks and add custom metal screens.' },
        { senderRole: 'client', message: 'Exactly! Let’s meet at the site next Tuesday.' }
      ] },
      // 7. Client Sarah -> Designer Clara (Pending)
      { clientIndex: 0, designerIndex: 5, budget: 400000, req: 'New construct energy-efficient timber frame cabin in Cascade range.', msg: 'Clara, I am looking for an architect to draw plans for a mountain escape utilizing smart heating systems.', status: 'pending', responses: [] },
      // 8. Client Marcus -> Designer Brandon (Responded)
      { clientIndex: 1, designerIndex: 6, budget: 90000, req: 'Vintage cocktail bar lounge fit-out in Los Angeles.', msg: 'Hello Brandon, we are launching a boutique retro lounge and need bespoke custom booths and warm neon lighting designs.', status: 'responded', responses: [
        { senderRole: 'designer', message: 'Hey Marcus, retro lounge environments are my absolute favorite. I have a collection of custom furniture vendors in LA we can source from.' }
      ] },
      // 9. Client Chloe -> Designer Hannah (Pending)
      { clientIndex: 2, designerIndex: 7, budget: 120000, req: 'Historical brownstone structural restoration and bath layout updates.', msg: 'Hi Hannah, we purchased a historic building in Boston and want to update the bathrooms while keeping the marble fireplaces.', status: 'pending', responses: [] }
    ];

    const inquiries = [];
    for (let inq of inquiryData) {
      const client = clients[inq.clientIndex];
      const designer = designers[inq.designerIndex];

      const inquiry = await Inquiry.create({
        clientId: client._id,
        designerId: designer._id,
        projectRequirement: inq.req,
        budget: inq.budget,
        message: inq.msg,
        status: inq.status,
        responses: inq.responses
      });
      inquiries.push(inquiry);
    }
    console.log(`${inquiries.length} inquiries created.`);

    // 7. Create Reviews (matching the inquiry history rule!)
    console.log('Creating Reviews...');
    const reviewData = [
      // Julian Vance reviews
      { clientIndex: 0, designerIndex: 0, rating: 5, feedback: 'Julian Vance was spectacular. The timber integration in our living room looks breath-taking. He kept us informed of structural requirements every step of the way.' },
      { clientIndex: 1, designerIndex: 0, rating: 4, feedback: 'Very creative architect. Julian designed a gorgeous open-concept kitchen partition. Communication was great, although structural materials took slightly longer to arrive.' },
      
      // Amelia Chen reviews
      { clientIndex: 2, designerIndex: 1, rating: 5, feedback: 'Amelia Chen is the master of warm minimalism! Our rental condo feels double the size and so tranquil. Highly recommend her lighting schemes.' },

      // Nikhil Mehta reviews
      { clientIndex: 5, designerIndex: 4, rating: 5, feedback: 'Excellent collaboration on our West Loop creative office! Nikhil took the time to understand our team workflow and integrated exposed brick beautifully.' }
    ];

    for (let rev of reviewData) {
      const client = clients[rev.clientIndex];
      const designer = designers[rev.designerIndex];

      await Review.create({
        clientId: client._id,
        designerId: designer._id,
        rating: rev.rating,
        feedback: rev.feedback
      });
    }
    console.log('Reviews created.');

    // 8. Recalculate average ratings for all designers
    console.log('Recalculating Designer average ratings...');
    for (let designer of designers) {
      const reviews = await Review.find({ designerId: designer._id });
      if (reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        designer.avgRating = Number(avg.toFixed(1));
        await designer.save();
      }
    }
    console.log('Designer average ratings updated.');

    // 9. Seed 1-2 moderation reports for admin queue
    console.log('Creating Moderation Reports...');
    await Report.create({
      reportedBy: clients[0]._id, // Sarah
      targetType: 'project',
      targetId: (await PortfolioProject.findOne({ designerId: designers[6]._id }))._id, // Brandon's project
      reason: 'Inappropriate project mockups containing duplicate image listings.',
      status: 'open'
    });

    await Report.create({
      reportedBy: clients[1]._id, // Marcus
      targetType: 'user',
      targetId: designers[3]._id, // Sophie Dubois profile
      reason: 'Wrong budget limits specified. The profile shows lower limits than actual quoting estimates.',
      status: 'open'
    });
    console.log('Reports created.');

    console.log('Database Seeding successfully completed!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Run script if executed directly
if (require.main === module) {
  connectDB().then(async () => {
    await seedData();
    await closeDB();
  });
}

module.exports = seedData;
