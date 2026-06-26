const Service = require('../models/Service');
const Coupon = require('../models/Coupon');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    // ── Seed Default Admin ──
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount === 0) {
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@ampedge.in';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
      const adminPhone = process.env.DEFAULT_ADMIN_PHONE || '+919999999999';

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'AmpEdge Admin',
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isPhoneVerified: true,
        referralCode: 'AMPADMIN',
      });

      logger.info(`[Seed] ✅ Default admin created: ${adminEmail} / ${adminPassword}`);
    }

    // Only seed other data if the database is empty
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      logger.info('[Seed] Database already has data, skipping services/products seed.');
      return;
    }

    logger.info('[Seed] Populating database with sample data...');

    // Seed Services
    await Service.insertMany([
      // REPAIR services
      {
        name: 'Wiring Repair',
        description: 'Fix faulty wiring, short circuits, and damaged cables in your home.',
        category: 'REPAIR',
        basePrice: 499,
        estimatedDuration: 60,
        city: 'Delhi',
      },
      {
        name: 'Switchboard Fix',
        description: 'Repair or replace damaged switchboards, sockets, and switches.',
        category: 'REPAIR',
        basePrice: 349,
        estimatedDuration: 45,
        city: 'Delhi',
      },
      {
        name: 'MCB/Fuse Repair',
        description: 'Fix tripping MCBs, blown fuses, and circuit breaker issues.',
        category: 'REPAIR',
        basePrice: 299,
        estimatedDuration: 30,
        city: 'Delhi',
      },
      // INSTALLATION services
      {
        name: 'Ceiling Fan Installation',
        description: 'Professional installation of ceiling fans with wiring and mounting.',
        category: 'INSTALLATION',
        basePrice: 599,
        estimatedDuration: 90,
        city: 'Delhi',
      },
      {
        name: 'LED Light Setup',
        description: 'Install LED panels, strip lights, or decorative lighting fixtures.',
        category: 'INSTALLATION',
        basePrice: 799,
        estimatedDuration: 120,
        city: 'Delhi',
      },
      {
        name: 'AC Installation',
        description: 'Split or window AC installation with copper piping and stabilizer setup.',
        category: 'INSTALLATION',
        basePrice: 1499,
        estimatedDuration: 180,
        city: 'Delhi',
      },
      // EMERGENCY services
      {
        name: 'Power Outage Fix',
        description: '24/7 emergency service for sudden power outages and blackouts.',
        category: 'EMERGENCY',
        basePrice: 899,
        estimatedDuration: 60,
        city: 'Delhi',
      },
      {
        name: 'Electric Shock Hazard',
        description: 'Urgent inspection and repair for electric shock and sparking issues.',
        category: 'EMERGENCY',
        basePrice: 999,
        estimatedDuration: 45,
        city: 'Delhi',
      },
      // COMMERCIAL services
      {
        name: 'Office Wiring Setup',
        description: 'Complete electrical wiring for offices, co-working spaces, and shops.',
        category: 'COMMERCIAL',
        basePrice: 4999,
        estimatedDuration: 480,
        city: 'Delhi',
      },
      {
        name: 'Electrical Audit',
        description: 'Full safety audit and compliance check for commercial buildings.',
        category: 'COMMERCIAL',
        basePrice: 2999,
        estimatedDuration: 240,
        city: 'Delhi',
      },
    ]);

    // Seed Coupons
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    await Coupon.insertMany([
      {
        code: 'WELCOME50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderValue: 200,
        maxDiscount: 250,
        validUntil,
        usageLimit: 1000,
      },
      {
        code: 'FLAT100',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderValue: 300,
        validUntil,
        usageLimit: 500,
      },
    ]);

    // Seed Subscriptions
    await Subscription.insertMany([
      {
        name: 'Basic Plan',
        description: 'Get priority booking and 10% off on all services.',
        pricePerMonth: 199,
        features: ['Priority Booking', '10% Discount', 'Email Support'],
      },
      {
        name: 'Pro Plan',
        description: 'Unlimited emergency calls, 25% off, and dedicated technician.',
        pricePerMonth: 499,
        features: ['Unlimited Emergency', '25% Discount', 'Dedicated Technician', 'Phone Support'],
      },
    ]);

    // Seed Products — Enhanced with brand, tier, specs, tags, rating, popularity
    const products = [
      // ── WIRING_MATERIALS ──
      {
        name: 'Havells 3-Core Flexible Copper Cable (90m)',
        description: 'High quality industrial grade electrical wire roll for home wiring and heavy appliances.',
        brand: 'Havells',
        tier: 'PREMIUM',
        category: 'WIRING_MATERIALS',
        specifications: '3-core, copper, 1.5 sqmm, PVC insulated, 90m roll',
        tags: ['wire', 'copper', 'cable', '1.5mm', 'havells', '3-core', 'flexible', 'electrical wire'],
        basePrice: 1250,
        stock: 45,
        rating: 4.5,
        popularity: 42,
        isActive: true,
      },
      {
        name: 'Polycab 1.5 sqmm Single Core Wire (90m)',
        description: 'Economy grade single core electrical wire for basic home wiring needs.',
        brand: 'Polycab',
        tier: 'MID_RANGE',
        category: 'WIRING_MATERIALS',
        specifications: 'single core, copper, 1.5 sqmm, PVC insulated, 90m',
        tags: ['wire', 'copper', 'cable', '1.5mm', 'polycab', 'single core', 'electrical wire'],
        basePrice: 850,
        stock: 80,
        rating: 4.2,
        popularity: 35,
        isActive: true,
      },
      {
        name: 'RR Kabel 1.5 sqmm Wire (90m)',
        description: 'Budget-friendly electrical wire for residential wiring projects.',
        brand: 'RR Kabel',
        tier: 'BUDGET',
        category: 'WIRING_MATERIALS',
        specifications: 'single core, copper, 1.5 sqmm, PVC, 90m',
        tags: ['wire', 'copper', 'cable', '1.5mm', 'rr kabel', 'budget wire', 'electrical wire'],
        basePrice: 620,
        stock: 100,
        rating: 3.8,
        popularity: 28,
        isActive: true,
      },
      {
        name: 'Legrand 32A Double Pole MCB',
        description: 'Provide ultimate protection to your electrical circuit against short circuits and overloads.',
        brand: 'Legrand',
        tier: 'PREMIUM',
        category: 'WIRING_MATERIALS',
        specifications: '32A, double pole, MCB, 240V, breaking capacity 10kA',
        tags: ['mcb', 'circuit breaker', '32a', 'legrand', 'double pole', 'protection'],
        basePrice: 480,
        stock: 120,
        rating: 4.6,
        popularity: 38,
        isActive: true,
      },
      {
        name: 'Havells 16A Single Pole MCB',
        description: 'Compact MCB for individual circuit protection in residential panels.',
        brand: 'Havells',
        tier: 'MID_RANGE',
        category: 'WIRING_MATERIALS',
        specifications: '16A, single pole, MCB, 240V',
        tags: ['mcb', 'circuit breaker', '16a', 'havells', 'single pole'],
        basePrice: 220,
        stock: 200,
        rating: 4.3,
        popularity: 45,
        isActive: true,
      },
      {
        name: 'Schneider 12-Way Distribution Board (DB Box)',
        description: 'Compact and elegant metallic distribution board with IP20 protection.',
        brand: 'Schneider',
        tier: 'PREMIUM',
        category: 'WIRING_MATERIALS',
        specifications: '12-way, metal, IP20, TPN, surface mount',
        tags: ['db box', 'distribution board', '12 way', 'schneider', 'panel board'],
        basePrice: 850,
        stock: 30,
        rating: 4.7,
        popularity: 22,
        isActive: true,
      },
      {
        name: 'Anchor Roma 6 Amp Switch (Pack of 10)',
        description: 'Modular classic white switches suitable for residential and commercial uses.',
        brand: 'Anchor',
        tier: 'MID_RANGE',
        category: 'WIRING_MATERIALS',
        specifications: '6A, modular, polycarbonate, ISI certified',
        tags: ['switch', '6a', 'anchor', 'roma', 'modular switch'],
        basePrice: 290,
        stock: 200,
        rating: 4.1,
        popularity: 55,
        isActive: true,
      },
      // ── APPLIANCES ──
      {
        name: 'Voltas 1.5 Ton 3 Star Split Inverter AC',
        description: 'Energy efficient air conditioner with 100% copper condenser and multi-stage filtration.',
        brand: 'Voltas',
        tier: 'MID_RANGE',
        category: 'APPLIANCES',
        specifications: '1.5 ton, 3 star, split, inverter, copper condenser, R32 refrigerant',
        tags: ['ac', 'air conditioner', '1.5 ton', '3 star', 'voltas', 'split ac', 'inverter'],
        basePrice: 32990,
        stock: 15,
        rating: 4.3,
        popularity: 30,
        isActive: true,
      },
      {
        name: 'Samsung 236L 2 Star Digital Inverter Refrigerator',
        description: 'Frost free double door refrigerator with digital inverter technology.',
        brand: 'Samsung',
        tier: 'PREMIUM',
        category: 'APPLIANCES',
        specifications: '236L, 2 star, frost free, double door, digital inverter',
        tags: ['refrigerator', 'fridge', '236l', 'samsung', 'double door', 'inverter'],
        basePrice: 22490,
        stock: 8,
        rating: 4.4,
        popularity: 18,
        isActive: true,
      },
      {
        name: 'Crompton 1200mm High Speed Ceiling Fan',
        description: 'Anti-dust elegant ceiling fan offering 380 RPM speed for powerful air delivery.',
        brand: 'Crompton',
        tier: 'MID_RANGE',
        category: 'APPLIANCES',
        specifications: '1200mm, 380 RPM, 75W, anti-dust coating',
        tags: ['fan', 'ceiling fan', '1200mm', 'crompton', 'high speed'],
        basePrice: 1450,
        stock: 60,
        rating: 4.2,
        popularity: 65,
        isActive: true,
      },
      {
        name: 'Orient Electric 1200mm Budget Ceiling Fan',
        description: 'Reliable ceiling fan with efficient motor and aerodynamic blade design.',
        brand: 'Orient',
        tier: 'BUDGET',
        category: 'APPLIANCES',
        specifications: '1200mm, 320 RPM, 72W',
        tags: ['fan', 'ceiling fan', '1200mm', 'orient', 'budget fan'],
        basePrice: 950,
        stock: 90,
        rating: 3.9,
        popularity: 50,
        isActive: true,
      },
      // ── TOOLS_EQUIPMENT ──
      {
        name: 'Bosch 13mm 600W Impact Drill Machine',
        description: 'Professional impact drill suitable for concrete, brick, and block drilling.',
        brand: 'Bosch',
        tier: 'PREMIUM',
        category: 'TOOLS_EQUIPMENT',
        specifications: '13mm chuck, 600W, 2800 RPM, impact drill',
        tags: ['drill', 'impact drill', '600w', 'bosch', '13mm', 'power tool'],
        basePrice: 2200,
        stock: 25,
        rating: 4.6,
        popularity: 33,
        isActive: true,
      },
      {
        name: 'Stanley 10-Piece Screwdriver Set',
        description: 'Magnetic tipped precision screwdriver set for electrical repair applications.',
        brand: 'Stanley',
        tier: 'MID_RANGE',
        category: 'TOOLS_EQUIPMENT',
        specifications: '10 piece, magnetic tip, chrome vanadium steel',
        tags: ['screwdriver', 'tool set', 'stanley', 'magnetic', 'precision'],
        basePrice: 450,
        stock: 80,
        rating: 4.4,
        popularity: 40,
        isActive: true,
      },
      {
        name: 'Taparia Heavy Duty Wire Cutter',
        description: 'Drop forged from high grade carbon steel, induction hardened edges for clean wire cutting.',
        brand: 'Taparia',
        tier: 'BUDGET',
        category: 'TOOLS_EQUIPMENT',
        specifications: 'carbon steel, induction hardened, 6 inch',
        tags: ['wire cutter', 'plier', 'taparia', 'cutting tool', 'hand tool'],
        basePrice: 195,
        stock: 150,
        rating: 4.0,
        popularity: 48,
        isActive: true,
      },
      // ── LIGHTING_FIXTURES ──
      {
        name: 'Philips 9W B22 LED Bulb (Pack of 4)',
        description: 'Energy efficient, bright white light (6500K) for all residential rooms.',
        brand: 'Philips',
        tier: 'MID_RANGE',
        category: 'LIGHTING_FIXTURES',
        specifications: '9W, B22, LED, 6500K, cool daylight, 900 lumen',
        tags: ['led bulb', '9w', 'philips', 'b22', 'bulb', 'light'],
        basePrice: 399,
        stock: 500,
        rating: 4.5,
        popularity: 72,
        isActive: true,
      },
      {
        name: 'Syska 20W LED Tube Light',
        description: 'Sleek polycarbonate batten offering flicker-free wide spread lighting.',
        brand: 'Syska',
        tier: 'BUDGET',
        category: 'LIGHTING_FIXTURES',
        specifications: '20W, LED tube, 6500K, polycarbonate, 2ft',
        tags: ['tube light', '20w', 'syska', 'led tube', 'batten', 'light'],
        basePrice: 249,
        stock: 120,
        rating: 4.1,
        popularity: 58,
        isActive: true,
      },
      {
        name: 'Wipro Garnet 15W LED Panel Light',
        description: 'Ultra slim recessed LED panel for false ceiling installations.',
        brand: 'Wipro',
        tier: 'MID_RANGE',
        category: 'LIGHTING_FIXTURES',
        specifications: '15W, LED panel, round, recessed, 6500K',
        tags: ['panel light', '15w', 'wipro', 'led panel', 'ceiling light', 'recessed'],
        basePrice: 520,
        stock: 70,
        rating: 4.3,
        popularity: 25,
        isActive: true,
      },
      // ── SMART_HOME ──
      {
        name: 'Wipro 16A WiFi Smart Plug',
        description: 'Control heavy appliances like AC and Geysers from your smartphone. Compatible with Alexa.',
        brand: 'Wipro',
        tier: 'MID_RANGE',
        category: 'SMART_HOME',
        specifications: '16A, WiFi, Alexa compatible, voice control, timer',
        tags: ['smart plug', '16a', 'wipro', 'wifi', 'alexa', 'smart home', 'iot'],
        basePrice: 999,
        stock: 45,
        rating: 4.2,
        popularity: 32,
        isActive: true,
      },
      {
        name: 'Echo Dot (5th Gen) Smart Speaker',
        description: 'The best sounding Echo Dot yet, perfect for voice-controlling your connected electrical appliances.',
        brand: 'Amazon',
        tier: 'PREMIUM',
        category: 'SMART_HOME',
        specifications: 'Alexa, WiFi, Bluetooth, 44mm speaker, matter hub',
        tags: ['smart speaker', 'echo dot', 'alexa', 'amazon', 'voice control', 'smart home'],
        basePrice: 5499,
        stock: 12,
        rating: 4.5,
        popularity: 20,
        isActive: true,
      },
    ];

    // Use Product.create loop to trigger pre-save hook for searchText computation
    for (const prod of products) {
      await Product.create(prod);
    }

    logger.info('[Seed] ✅ Database seeded with 10 services, 2 coupons, 2 subscriptions, and ' + products.length + ' products (with AI-ready metadata).');
  } catch (error) {
    logger.error('[Seed] Error seeding database: ' + error.message);
  }
};

module.exports = seedDatabase;
