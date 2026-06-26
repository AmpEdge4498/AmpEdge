const request = require('supertest');
const app = require('../server');
const Booking = require('../models/Booking');
const User = require('../models/User');

describe('Bookings API', () => {
  let customerToken;
  let customerId;

  beforeEach(async () => {
    // Register and login a customer user to get token
    const testUser = {
      name: 'Booking User',
      email: 'booking@example.com',
      password: 'password123',
      role: 'customer'
    };
    
    await request(app).post('/api/v1/auth/register').send(testUser);
    
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    
    customerToken = loginRes.body.token;
    
    const user = await User.findOne({ email: testUser.email });
    customerId = user._id;
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a new booking for authenticated user', async () => {
      const newBooking = {
        serviceId: '60d0fe4f5311236168a109ca',
        date: new Date().toISOString(),
        timeSlot: '10:00 AM',
        address: '123 Test St',
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(newBooking);

      // We expect the booking controller to return 201 Created
      // (Even if serviceId is fake, the controller might just save the booking if not heavily validated)
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.customer.toString()).toBe(customerId.toString());
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should fetch user bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
