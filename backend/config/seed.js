const Service = require('../models/Service');
const Coupon = require('../models/Coupon');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');

const seedDatabase = async () => {
  try {
    // Only seed if the database is empty
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      console.log('[Seed] Database already has data, skipping.');
      return;
    }

    console.log('[Seed] Populating database with sample data...');

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

    // Seed Products
    await Product.insertMany([
      { name: 'Havells 3-Core Flexible Copper Cable (90m)', description: 'High quality industrial grade electrical wire roll.', category: 'WIRING_MATERIALS', basePrice: 1250, stock: 45, isActive: true },
      { name: 'Legrand 32A Double Pole MCB', description: 'Provide ultimate protection against short circuits.', category: 'WIRING_MATERIALS', basePrice: 480, stock: 120, isActive: true },
      { name: 'Schneider 12-Way DB Box', description: 'Compact and elegant metallic distribution board.', category: 'WIRING_MATERIALS', basePrice: 850, stock: 30, isActive: true },
      { name: 'Anchor Roma 6 Amp Switch (Pack of 10)', description: 'Modular classic white switches.', category: 'WIRING_MATERIALS', basePrice: 290, stock: 200, isActive: true },
      
      { name: 'Voltas 1.5 Ton 3 Star AC', description: 'Energy efficient split air conditioner.', category: 'APPLIANCES', basePrice: 32990, stock: 15, isActive: true },
      { name: 'Samsung 236L Refrigerator', description: 'Frost free double door digital inverter.', category: 'APPLIANCES', basePrice: 22490, stock: 8, isActive: true },
      { name: 'Crompton 1200mm Ceiling Fan', description: 'Anti-dust elegant ceiling fan.', category: 'APPLIANCES', basePrice: 1450, stock: 60, isActive: true },

      { name: 'Bosch 13mm 600W Impact Drill', description: 'Professional impact drill.', category: 'TOOLS_EQUIPMENT', basePrice: 2200, stock: 25, isActive: true },
      { name: 'Stanley 10-Piece Screwdriver', description: 'Magnetic precision screwdriver set.', category: 'TOOLS_EQUIPMENT', basePrice: 450, stock: 80, isActive: true },
      { name: 'Taparia Heavy Duty Wire Cutter', description: 'Induction hardened edge cutter.', category: 'TOOLS_EQUIPMENT', basePrice: 195, stock: 150, isActive: true },

      { name: 'Philips 9W B22 LED (Pack of 4)', description: 'Energy efficient bright light.', category: 'LIGHTING_FIXTURES', basePrice: 399, stock: 500, isActive: true },
      { name: 'Syska 20W LED Tube Light', description: 'Sleek polycarbonate batten offering wide spread.', category: 'LIGHTING_FIXTURES', basePrice: 249, stock: 120, isActive: true },

      { name: 'Wipro 16A WiFi Smart Plug', description: 'Control heavy appliances from smartphone.', category: 'SMART_HOME', basePrice: 999, stock: 45, isActive: true },
      { name: 'Echo Dot (5th Gen)', description: 'Smart speaker for connected appliances.', category: 'SMART_HOME', basePrice: 5499, stock: 12, isActive: true }
    ]);

    console.log('[Seed] ✅ Database seeded with 10 services, 2 coupons, 2 subscriptions, and 14 products.');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error.message);
  }
};

module.exports = seedDatabase;
