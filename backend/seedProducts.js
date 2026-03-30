const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const mockProducts = [
  // WIRING_MATERIALS
  {
    name: 'Havells 3-Core Flexible Copper Cable (90m)',
    description: 'High quality industrial grade electrical wire roll for home wiring and heavy appliances.',
    category: 'WIRING_MATERIALS',
    basePrice: 1250,
    stock: 45,
    isActive: true
  },
  {
    name: 'Legrand 32A Double Pole MCB',
    description: 'Provide ultimate protection to your electrical circuit against short circuits and overloads.',
    category: 'WIRING_MATERIALS',
    basePrice: 480,
    stock: 120,
    isActive: true
  },
  {
    name: 'Schneider 12-Way Distribution Board (DB Box)',
    description: 'Compact and elegant metallic distribution board with IP20 protection.',
    category: 'WIRING_MATERIALS',
    basePrice: 850,
    stock: 30,
    isActive: true
  },
  {
    name: 'Anchor Roma 6 Amp Switch (Pack of 10)',
    description: 'Modular classic white switches suitable for residential and commercial uses.',
    category: 'WIRING_MATERIALS',
    basePrice: 290,
    stock: 200,
    isActive: true
  },

  // APPLIANCES
  {
    name: 'Voltas 1.5 Ton 3 Star Split Inverter AC',
    description: 'Energy efficient air conditioner with 100% copper condenser and multi-stage filtration.',
    category: 'APPLIANCES',
    basePrice: 32990,
    stock: 15,
    isActive: true
  },
  {
    name: 'Samsung 236L 2 Star Digital Inverter Refrigerator',
    description: 'Frost free double door refrigerator with digital inverter technology.',
    category: 'APPLIANCES',
    basePrice: 22490,
    stock: 8,
    isActive: true
  },
  {
    name: 'Crompton 1200mm High Speed Ceiling Fan',
    description: 'Anti-dust elegant ceiling fan offering 380 RPM speed for powerful air delivery.',
    category: 'APPLIANCES',
    basePrice: 1450,
    stock: 60,
    isActive: true
  },

  // TOOLS_EQUIPMENT
  {
    name: 'Bosch 13mm 600W Impact Drill Machine',
    description: 'Professional impact drill suitable for concrete, brick, and block drilling.',
    category: 'TOOLS_EQUIPMENT',
    basePrice: 2200,
    stock: 25,
    isActive: true
  },
  {
    name: 'Stanley 10-Piece Screwdriver Set',
    description: 'Magnetic tipped precision screwdriver set for electrical repair applications.',
    category: 'TOOLS_EQUIPMENT',
    basePrice: 450,
    stock: 80,
    isActive: true
  },
  {
    name: 'Taparia Heavy Duty Wire Cutter',
    description: 'Drop forged from high grade carbon steel, induction hardened edges for clean wire cutting.',
    category: 'TOOLS_EQUIPMENT',
    basePrice: 195,
    stock: 150,
    isActive: true
  },

  // LIGHTING_FIXTURES
  {
    name: 'Philips 9W B22 LED Bulb (Pack of 4)',
    description: 'Energy efficient, bright white light (6500K) for all residential rooms.',
    category: 'LIGHTING_FIXTURES',
    basePrice: 399,
    stock: 500,
    isActive: true
  },
  {
    name: 'Syska 20W LED Tube Light',
    description: 'Sleek polycarbonate batten offering flicker-free wide spread lighting.',
    category: 'LIGHTING_FIXTURES',
    basePrice: 249,
    stock: 120,
    isActive: true
  },

  // SMART_HOME
  {
    name: 'Wipro 16A WiFi Smart Plug',
    description: 'Control heavy appliances like AC and Geysers from your smartphone. Compatible with Alexa.',
    category: 'SMART_HOME',
    basePrice: 999,
    stock: 45,
    isActive: true
  },
  {
    name: 'Echo Dot (5th Gen) Smart Speaker',
    description: 'The best sounding Echo Dot yet, perfect for voice-controlling your connected electrical appliances.',
    category: 'SMART_HOME',
    basePrice: 5499,
    stock: 12,
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Wiping existing products...');
    await Product.deleteMany();
    
    console.log('Seeding new Flipkart-style products...');
    for (const prod of mockProducts) {
      await Product.create(prod);
    }
    
    console.log('Successfully seeded electrical marketplace items!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
};

seedProducts();
