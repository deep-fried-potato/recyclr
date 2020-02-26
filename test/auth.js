var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../index')
var token = ""
var id = ""
chai.use(chaiHttp);
chai.should();
describe("Auth Tests", () => {
  describe("POST /auth/registerUser",()=>{
    it("Should create new test account",(done)=>{
      loginCreds={"email":"test@test.com","password":"royya123","name":"Test Account"}
      chai.request(app)
        .post('/auth/registerUser')
        .send(loginCreds)
        .end((err,res)=>{
          res.should.have.status(200)
          id = res.body[0]._id
          done();
        })
    })
  })
  describe("GET /auth/verifyUserEmail",()=>{
    it("Should verify User Email",(done)=>{
      chai.request(app)
        .get('/auth/verifyUserEmail/'+id)
        .end((err,res)=>{
          res.should.have.status(200)
          done();
        })
    })
  })
  describe("POST /auth/userLogin",()=>{
    it("Should login to the account",(done)=>{
      loginCreds={"email":"test@test.com","password":"royya123"}
      chai.request(app)
        .post('/auth/userLogin')
        .send(loginCreds)
        .end((err,res)=>{
          res.should.have.status(200)
          token = res.body.token
          done();
        })
    })
  })
  describe("POST /auth/userLogin Reject Wrong Password ",()=>{
    it("Should return forbidden for wrong password",(done)=>{
      loginCreds={"email":"test@test.com","password":"royya123456"}
      chai.request(app)
        .post('/auth/userLogin')
        .send(loginCreds)
        .end((err,res)=>{
          res.should.have.status(403)
          done();
        })
    })
  })
  describe("POST /auth/registerUser Prevent Duplicate Users ",()=>{
    it("Should return conflict error for multiple accounts for same email",(done)=>{
      loginCreds={"email":"test@test.com","password":"royya123","name":"Test Account"}
      chai.request(app)
        .post('/auth/registerUser')
        .send(loginCreds)
        .end((err,res)=>{
          res.should.have.status(409)
          done();
        })
    })
  })
  describe("DELETE test profile",()=>{
    it(" ",(done)=>{
      chai.request(app)
        .post('/auth/testcleanup')
        .end((err,res)=>{
          res.should.have.status(200)
          done();
        })
    })
  })
});
