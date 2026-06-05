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



//Below is the route for admin page
router.post("/adminsignup", async(req,res)=>{
 const{Name,Surname,Email,Password}=req.body;
 const hashedPassword=await bcrypt.hash(Password,10);
 const sql="INSERT INTO admins(Name,Surname,Email,Password) VALUES(?,?,?,?)";
 db.query(sql, [Name,Surname,Email,hashedPassword], (err,results)=>{
 
    if(err){
       return res.send("Error: "+err);
    }
    else{
      res.send("Admin has been created succesfully"); 
    }


 });

});
//Below is the route for admin page
router.post("/adminlogin", (req,res)=>{
const {Name,Email,Password}=req.body;
const sql="SELECT * FROM admins WHERE Email=?";
db.query(sql,[Email], async(err,results)=>{
if(err)return res.send("Error:");
if(results.length==0){
   return res.send("User not found");
}
const user=results[0];
const isMatch= await bcrypt.compare(Password,user.Password);

if(!isMatch){
  return res.send("Incorrect Password");

}
req.session.user=user;
res.redirect("adminDashboard.html");

});

});

router.post("/reportssubmission",async(req,res)=>{
const{MistreatmentType,Description,OccurrenceDate,CompanyName,Status}=req.body;
 const UserID = req.session.user.UserID;
const sql="INSERT INTO reports(UserId,MistreatmentType,Description,OccurrenceDate,CompanyName,Status) VALUES(?,?,?,?,?,?)";
db.query(sql,[UserID,MistreatmentType,Description,OccurrenceDate,CompanyName,Status],(err,result)=>{

if(err){

    return res.send("Error: "+err);

}
else{
    res.send("Your report is sent successfully ");
}

});




});






module.exports=router;