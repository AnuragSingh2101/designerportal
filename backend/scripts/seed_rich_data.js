const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB, closeDB } = require('../config/db');

const User = require('../models/User');
const DesignerProfile = require('../models/DesignerProfile');
const PortfolioProject = require('../models/PortfolioProject');
const Review = require('../models/Review');
const Article = require('../models/Article');
const InspirationBoard = require('../models/InspirationBoard');

const cleanEnvVar = (val) => val ? val.replace(/^['"]|['"]$/g, '') : val;

const seedRichData = async () => {
  try {
    console.log('Starting rich seeding process...');

    // 1. Purge Existing Seeding Targets to prevent duplication
    await User.deleteMany({ email: { $in: ['sarah@atelier.com', 'liam@atelier.com', 'alice@client.com'] } });
    await Article.deleteMany({});
    
    // Find matching designer profiles and delete them, and their projects/reviews
    const oldUsers = await User.find({ email: { $in: ['sarah@atelier.com', 'liam@atelier.com'] } });
    const oldUserIds = oldUsers.map(u => u._id);
    const oldProfiles = await DesignerProfile.find({ userId: { $in: oldUserIds } });
    const oldProfileIds = oldProfiles.map(p => p._id);
    
    await DesignerProfile.deleteMany({ userId: { $in: oldUserIds } });
    await PortfolioProject.deleteMany({ designerId: { $in: oldProfileIds } });
    await Review.deleteMany({ designerId: { $in: oldProfileIds } });
    await InspirationBoard.deleteMany({});

    console.log('Existing mock data cleaned successfully.');

    // 2. Hash Passwords
    const salt = await bcrypt.genSalt(10);
    const designerPasswordHash = await bcrypt.hash('designer123', salt);
    const clientPasswordHash = await bcrypt.hash('client123', salt);

    // 3. Create Users
    const sarahUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@atelier.com',
      passwordHash: designerPasswordHash,
      role: 'designer',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80'
    });

    const liamUser = await User.create({
      name: 'Liam Carter',
      email: 'liam@atelier.com',
      passwordHash: designerPasswordHash,
      role: 'designer',
      profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=faces&q=80'
    });

    const aliceUser = await User.create({
      name: 'Alice Miller',
      email: 'alice@client.com',
      passwordHash: clientPasswordHash,
      role: 'client',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces&q=80'
    });

    console.log('Users created.');

    // 4. Create Designer Profiles
    const sarahProfile = await DesignerProfile.create({
      userId: sarahUser._id,
      expertise: ['architecture', 'interior_design'],
      experienceYears: 12,
      location: 'San Francisco, CA',
      budgetMin: 50000,
      budgetMax: 500000,
      bio: 'Sarah Jenkins is an award-winning residential architect specializing in biophilic structures and sustainable, net-zero luxury homes. She holds a Master of Architecture from UC Berkeley.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&q=80',
      avgRating: 5.0,
      isVerified: true,
      licenseType: 'AIA',
      licenseNumber: 'AIA-98310'
    });

    const liamProfile = await DesignerProfile.create({
      userId: liamUser._id,
      expertise: ['interior_design'],
      experienceYears: 8,
      location: 'Austin, TX',
      budgetMin: 20000,
      budgetMax: 150000,
      bio: 'Liam is an interior architect known for warm minimalist and Japandi spaces. He blends natural materials, customized cabinetry, and smart home lighting to optimize layouts.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces&q=80',
      avgRating: 5.0,
      isVerified: true,
      licenseType: 'NCIDQ',
      licenseNumber: 'NCIDQ-09312'
    });

    console.log('Designer profiles created.');

    // 5. Create Portfolio Projects (Case Studies)
    await PortfolioProject.create([
      {
        designerId: sarahProfile._id,
        title: 'The Biophilic Cliffside Estate',
        description: 'A 4,500 sq ft concrete and cedar wood construction engineered along a coastal ridge. Features passive solar heating, a rainwater harvesting network, and floor-to-ceiling glass paneling to blend the interior with the surrounding landscape.',
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
        ],
        style: 'Biophilic',
        category: 'Residential',
        beforeAfterImages: {
          before: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
          after: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
        },
        budgetTier: 'Luxury',
        roomType: 'Whole House',
        specifications: {
          durationWeeks: 48,
          costUSD: 520000,
          materialsUsed: ['Off-form concrete', 'Western Red Cedar', 'Double-glazed Low-E glass', 'Reclaimed oak boards']
        },
        caseStudyDetails: {
          objectives: 'Design a luxury retreat that minimizes ecological disruption and integrates seamlessly into the steep coastal site.',
          challenges: 'The coastal cliff posed massive structural stability challenges, requiring deep pile foundation pinning, while local bylaws restricted building heights and visibility from the highway.',
          solutions: 'We utilized a cantilevered concrete foundation anchored into the rock. The structure is low-slung, with a living green roof that visually merges with the surrounding hillside.'
        }
      },
      {
        designerId: sarahProfile._id,
        title: 'Net-Zero Urban Townhome',
        description: 'A multi-family passive house built in a dense metropolitan area. Incorporates high-efficiency thermal envelopes and rooftop solar grids.',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80'
        ],
        style: 'Modern',
        category: 'Residential',
        beforeAfterImages: {
          before: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80',
          after: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
        },
        budgetTier: 'Premium',
        roomType: 'Whole House',
        specifications: {
          durationWeeks: 32,
          costUSD: 240000,
          materialsUsed: ['CLT Panels', 'Triple-pane glazed windows', 'Recycled steel cladding']
        },
        caseStudyDetails: {
          objectives: 'Deliver a modern, carbon-neutral multi-story residence in an urban infill site.',
          challenges: 'Narrow plot access and strict shadowing regulations from neighboring brick buildings.',
          solutions: 'Designed a split-level solar chimney that brings light deep into the home, with pre-fabricated CLT panels for rapid, low-impact urban assembly.'
        }
      },
      {
        designerId: liamProfile._id,
        title: 'Japandi Kitchen & Dining Lounge',
        description: 'Renovation of a cluttered suburban kitchen into a serene, light-filled culinary and dining environment.',
        images: [
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
        ],
        beforeAfterImages: {
          before: 'https://images.unsplash.com/photo-1565182999561-18d7db6fc977?w=1200&q=80',
          after: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80'
        },
        style: 'Japandi',
        category: 'Renovation',
        budgetTier: 'Medium',
        roomType: 'Kitchen',
        specifications: {
          durationWeeks: 12,
          costUSD: 45000,
          materialsUsed: ['White oak timber slats', 'Calacatta marble counters', 'Fluted glass cabinets', 'Recycled clay tiles']
        },
        caseStudyDetails: {
          objectives: 'Create a clutter-free space that combines Japanese minimalism with Scandinavian functional warmth.',
          challenges: 'Low ceiling heights and poorly located plumbing load lines that could not be moved.',
          solutions: 'We built custom ceiling-height oak veneer cabinets to draw the eye upwards, concealing plumbing columns, and implemented sliding screens to separate pantry areas.'
        }
      },
      {
        designerId: liamProfile._id,
        title: 'Biophilic Retail Workspace',
        description: 'A premium open-concept workspace featuring indoor trees, hanging planters, and custom acoustic ceiling arrays.',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80'
        ],
        style: 'Scandinavian',
        category: 'Commercial',
        beforeAfterImages: {
          before: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
          after: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
        },
        budgetTier: 'Premium',
        roomType: 'Office',
        specifications: {
          durationWeeks: 16,
          costUSD: 95000,
          materialsUsed: ['Recycled PET felt baffles', 'Polished terrazzo', 'Native indoor flora']
        },
        caseStudyDetails: {
          objectives: 'Improve team collaboration and mental wellbeing in a post-pandemic corporate headquarters.',
          challenges: 'High echoes due to polished concrete floors and exposed steel ducts.',
          solutions: 'Suspended organic-shaped acoustic PET felt panels from the ceiling and introduced a network of biophilic zones with automated self-watering irrigation.'
        }
      }
    ]);

    console.log('Portfolio projects created.');

    // 6. Create Reviews
    await Review.create([
      {
        clientId: aliceUser._id,
        designerId: sarahProfile._id,
        rating: 5,
        feedback: 'Sarah designed our biophilic coastal home. She navigated the permitting with absolute professionalism and delivered a space that exceeds our expectations. Highly recommended.'
      },
      {
        clientId: aliceUser._id,
        designerId: liamProfile._id,
        rating: 5,
        feedback: "Liam's attention to detail during our Japandi kitchen renovation was incredible. The materials feel premium and the layout is extremely functional."
      }
    ]);

    console.log('Reviews created.');

    // 7. Create Articles
    await Article.create([
      {
        title: 'The Rise of Warm Minimalism in 2026',
        slug: 'rise-of-warm-minimalism-2026',
        summary: 'Explore how current interior designs are shifting away from cold, sterile spaces to embrace natural textures, earth tones, and biophilic integrations.',
        content: `Modern design is undergoing a silent revolution. For years, minimalism was associated with stark white walls, stainless steel surfaces, and a cold, almost museum-like lack of personality. Today, a new movement is reclaiming this philosophy: **Warm Minimalism**.

Warm minimalism maintains the clutter-free, functional core of traditional minimalist planning but overlays it with tactile textures, organic curves, and soft, earth-inspired tones. It values quality over quantity, focusing on bespoke furniture and natural finishes.

### Core Pillars of Warm Minimalism
1. **Natural Materials:** Incorporate travertine stone, white oak, linen, and clay-based plasters. These materials catch sunlight beautifully and add visual depth.
2. **Curated Color Palettes:** Move away from stark whites. Use warm ivory, beige, taupe, and soft terracottas as your primary palette.
3. **Biophilic Integrations:** Connect interior spaces with nature by placing indoor olive trees, biophilic partition racks, and large windows that frame the natural scenery.

By emphasizing comfort and warmth alongside spatial discipline, designers are creating homes that look stunning while remaining livable.`,
        category: 'Trends',
        coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
        readingTimeMinutes: 4,
        authorName: 'Sarah Jenkins, AIA',
        tags: ['minimalism', 'interior-trends', 'warm-minimalism', 'biophilic']
      },
      {
        title: 'Designing Net-Zero Passive Houses',
        slug: 'designing-net-zero-passive-houses',
        summary: 'An architectural guide to planning net-zero energy buildings using thermal envelopes, passive solar positioning, and smart materials.',
        content: `Sustainable design is no longer a luxury choice; it is an architectural necessity. Passive houses represent the gold standard in green building, using up to 90% less energy for heating and cooling compared to traditional homes.

### The Passive House Equation
To achieve net-zero status, architects must optimize three main parameters: orientation, insulation, and ventilation.

1. **Solar Orientation:** Buildings should face south to maximize winter solar heat gain, while utilizing horizontal roof overhangs to shade the building from hot summer sun.
2. **Super-Insulated Envelope:** Continuous thermal insulation wraps the structure, eliminating thermal bridges. Combined with triple-glazed windows, heat transfer is virtually stopped.
3. **Heat Recovery Ventilation (HRV):** An HRV system ensures a constant supply of fresh, filtered outdoor air while transferring heat from outgoing exhaust air to the incoming fresh air stream.

By executing these core strategies, designers can achieve structural carbon neutrality without compromising on luxury or thermal comfort.`,
        category: 'Sustainability',
        coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
        readingTimeMinutes: 6,
        authorName: 'Liam Carter',
        tags: ['passive-house', 'sustainability', 'architecture', 'net-zero']
      },
      {
        title: 'Integrating Smart Home Technology Semlessly',
        slug: 'integrating-smart-home-tech',
        summary: 'How to embed hidden audio systems, automated lighting arrays, and smart thermostats without disrupting premium design aesthetics.',
        content: `The modern home must be smart, but it shouldn't feel like a server room. True luxury lies in technology that is felt but not seen. When integrating ambient sound systems or control panels, the architect and tech consultant must work together early.

### Concealed Technology Techniques
- **Acoustic Plasters & In-Wall Audio:** Rather than mounting bulky black speakers on white gypsum walls, premium designs utilize plaster-covered, vibration-based speakers that turn the wall itself into a speaker.
- **Centralized Lighting Enclosures:** Say goodbye to grids of standard light switches. By moving dimmers and relays to a utility closet, the living space is left with simple, custom brass keypads that control entire room scenes.
- **Embedded Sensors:** Ambient temperature, motion, and humidity sensors can be hidden behind customized wood slats or within wall joints to avoid visual clutter.

Designing high-end systems requires coordination at the framing stage, ensuring tech elevates rather than compromises the space.`,
        category: 'Smart Homes',
        coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80',
        readingTimeMinutes: 5,
        authorName: 'Atelier Editorial Team',
        tags: ['smart-home', 'home-automation', 'minimalism']
      }
    ]);

    console.log('Articles created.');
    console.log('Rich Seeding completed successfully!');
  } catch (error) {
    console.error('Rich Seeding error:', error);
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedRichData();
    await closeDB();
  });
}

module.exports = seedRichData;
