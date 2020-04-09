var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../index')
var token = ""
var id = ""
var partId = ""
chai.use(chaiHttp);
chai.should();
describe("Admin Tests", () => {
  describe("POST /auth/userLogin",()=>{
    it("Should login to the account",(done)=>{
      loginCreds={"email":"sri.sailesh.m@gmail.com","password":"royya123"}
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
  describe("GET /part",()=>{
    it("Should get all parts",(done)=>{
      chai.request(app)
      .get("/shop/part")
      .set('x-access-token',token)
      .end((err,res)=>{
        res.should.have.status(200)
        done();
        })
      })
    })
  describe("GET /device",()=>{
    it("Should get all devices",(done)=>{
      chai.request(app)
      .get("/shop/device")
      .set('x-access-token',token)
      .end((err,res)=>{
        res.should.have.status(200)
        done();
        })
      })
    })
  describe("POST /part",()=>{
    it("Should create new part",(done)=>{
      var newPart = {
      	"name":"DUMMAYY",
      	"partType":"motherboard",
      	"description":"motherboard for Oneplus 5",
      	"variant":"6GB/64GB"
      }
      chai.request(app)
      .post("/shop/part")
      .set('x-access-token',token)
      .send(newPart)
      .end((err,res)=>{
        res.should.have.status(200)
        partId = res.body._id
        done();
        })
      })
    })
  describe("DELETE /part",()=>{
    it("should delete created part",(done)=>{
      chai.request(app)
      .delete("/shop/part/"+partId)
      .set('x-access-token',token)
      .end((err,res)=>{
        res.should.have.status(200)
        done();
      })
    })
  })
});
