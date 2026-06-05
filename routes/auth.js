const express=require("express");
const bcrypt=require("bcryptjs");
const db=require("../db");

const router=express.Router();

router.post("/signup", async (req,res)=>{
      console.log(req.body);
const {Title,Gender,Name,Surname,Email,CompanyName,HearAboutUs,Password}=req.body;
const hashedPassword=await bcrypt.hash(Password, 10);
const sql="INSERT INTO users (Title,Gender,Name,Surname,Email,CompanyName,HearAboutUs,Password) VALUES(?,?,?,?,?,?,?,?)"
db.query(sql,[Title,Gender,Name,Surname,Email,CompanyName,HearAboutUs,hashedPassword]  ,(err,result)=>{

if(err){
    return res.send("Error: "+err);
}
else{
    res.send("user was created succesfully");
}

})


});

module.exports=router;