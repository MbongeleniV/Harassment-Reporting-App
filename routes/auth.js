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

router.post("/login",  (req,res)=>{

const {Name,Email,Password}=req.body;
const sql="SELECT * FROM users WHERE Email=?";
db.query(sql,[Email], async (err,results)=>{

if(err) return res.send("Error");

if(results.length==0){

return res.send("User not Found");
}
const user=results[0];
const isMatch=await bcrypt.compare(Password,user.Password);

if(!isMatch){

    return res.send("Incorrect password");
}

req.session.user=user;
res.redirect("report.html");

});



});

module.exports=router;