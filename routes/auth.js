const express=require("express");
const bcrypt=require("bcryptjs");
const multer= require ("multer");




const db=require("../db");

const router=express.Router();

//code for multer


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

//Route for multer image uploads
router.post(
    "/reportssubmission",
    upload.array("evidenceFiles", 10),
    (req, res) => {

        const {
            MistreatmentType,
            Description,
            OccurrenceDate,
            CompanyName
        } = req.body;

        const UserID = req.session.user.UserID;

        const reportSql = `
            INSERT INTO Reports
            (UserID, MistreatmentType, Description, OccurrenceDate, CompanyName)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            reportSql,
            [
                UserID,
                MistreatmentType,
                Description,
                OccurrenceDate,
                CompanyName
            ],
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.send("Error creating report");
                }

                const reportID = result.insertId;

                if (req.files.length === 0) {
                    return res.send("Report submitted successfully");
                }

                req.files.forEach(file => {

                    const evidenceSql = `
                        INSERT INTO Evidence
                        (ReportID, FileName, FilePath)
                        VALUES (?, ?, ?)
                    `;

                    db.query(
                        evidenceSql,
                        [
                            reportID,
                            file.originalname,
                            "/uploads/" + file.filename
                        ]
                    );
                });

                res.send("Report and evidence uploaded successfully");
            }
        );
    }
);
// end code for multer




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


router.get("/user-data", (req,res)=>{
if(!req.session.user){

    return res.status(401).send("unathorized")
}

//use the UserID stored in the session during login
const UserID=req.session.user.UserID;
const sql="SELECT  users.UserID, users.Name, users.Surname, users.Email ,users.Gender,users.CompanyName,  reports.ReportID, reports.MistreatmentType, reports.Description, reports.DateSubmitted, reports.Status  FROM users INNER JOIN reports ON users.UserID = reports.UserID  WHERE users.UserID = ?  ";

db.query(sql,[UserID], (err,results)=>{

    if(err) return res.send("Error");
    if(results.length==0){
        return res.send("User not found");

    }
    const user=results[0];
    delete user.Password;
    res.json(user);

});




});

//logging out a user
router.get("/logout",(req,res)=>{
req.session.destroy((err)=>{
    if(err){
         return res.status(500).send("Could not log out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login.html");
   
});

});





module.exports=router;