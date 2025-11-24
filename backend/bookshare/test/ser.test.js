const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mockingoose = require('mockingoose');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { expect } = chai;
chai.use(chaiHttp);

describe('User API', () => {
  const fakeUser = {
    _id: '64fa1234567890abcdef1234',
    name: 'John',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'buyer'
  };

  const token = jwt.sign({ id: fakeUser._id, role: fakeUser.role }, 'change_this_secret');

  beforeEach(() => {
    mockingoose.resetAll();
  });

  // ------------------ Register ------------------
  it('POST /api/register should register a user', (done) => {
    mockingoose(User).toReturn(null, 'findOne'); // ไม่มี user ซ้ำ
    mockingoose(User).toReturn(fakeUser, 'save'); // mock create/save

    chai.request(app)
      .post('/api/register')
      .send({ name: 'John', email: 'john@example.com', password: '123456' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.property('name', 'John');
        done();
      });
  });

  // ------------------ Login ------------------
  it('POST /api/login should login user', (done) => {
    // mock findOne
    const userMock = new User(fakeUser);
    userMock.comparePassword = () => Promise.resolve(true);
    mockingoose(User).toReturn(userMock, 'findOne');

    chai.request(app)
      .post('/api/login')
      .send({ email: 'john@example.com', password: '123456' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        expect(res.body.user).to.have.property('email', 'john@example.com');
        done();
      });
  });

  // ------------------ Get Profile ------------------
  it('GET /api/profile should return user profile', (done) => {
    mockingoose(User).toReturn(fakeUser, 'findOne');

    chai.request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('email', 'john@example.com');
        done();
      });
  });

  // ------------------ Get Users (admin) ------------------
  it('GET /api/users should return all users', (done) => {
    mockingoose(User).toReturn([fakeUser], 'find');

    chai.request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  // ------------------ Reset Password ------------------
  it('POST /api/reset-password should reset user password', (done) => {
    const userMock = new User(fakeUser);
    mockingoose(User).toReturn(userMock, 'findOne');

    chai.request(app)
      .post('/api/reset-password')
      .send({ email: 'john@example.com', newPassword: 'newpass123' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.include('has been reset');
        done();
      });
  });
});
