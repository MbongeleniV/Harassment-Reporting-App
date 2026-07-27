const express=require("express");
const bcrypt=require("bcryptjs");
const multer= require ("multer");

const db=require("../db");

const router=express.Router();

//code for multer
const storage = multer.diskStorage({destination: (req, file, cb) => {
    
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

//Route for multer image uploads
router.post("/reportssubmission",upload.array("evidenceFiles", 10),(req, res) => {
    
        const {MistreatmentType,Description,OccurrenceDate,CompanyName } = req.body;
            
        const UserID = req.session.user.UserID;

        const reportSql = `INSERT INTO Reports (UserID, MistreatmentType, Description, OccurrenceDate, CompanyName) VALUES (?, ?, ?, ?, ?)  `;
    
        db.query(reportSql,[UserID,MistreatmentType, Description,OccurrenceDate,CompanyName ],(err, result) => {
            
                if (err) {
                    console.log(err);
                    return res.send("Error creating report");
                }

                const reportID = result.insertId;

                if (req.files.length === 0) {
                    return res.send("Report submitted successfully");
                }

                req.files.forEach(file => {

                    const evidenceSql = `  INSERT INTO Evidence  (ReportID, FileName, FilePath)   VALUES (?, ?, ?)  `;
                       db.query( evidenceSql,    [   reportID, file.originalname,"/uploads/" + file.filename ]
                    
                    );
                });

                res.send("Report and evidence uploaded successfully");
            }
        );
    }
);
// end code for multer

//code for user employee signup "employee signup express API"
router.post("/signup", async (req,res)=>{
      console.log(req.body);
const {Title,Gender,Name,Surname,Email,CompanyName,HearAboutUs,Password}=req.body;
const hashedPassword= await bcrypt.hash(Password, 10);
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
  
    console.log(req.body);
   
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


//Below is the route for admin sign up page

router.post("/adminSignup", async(req,res)=>{
 const{Name,Surname,Email,Password}=req.body;
 const hashedPassword=await bcrypt.hash(Password,10);
 const sql="INSERT INTO admins(Name,Surname,Email,Password) VALUES(?,?,?,?)";
 db.query(sql, [Name,Surname,Email,hashedPassword], (err,results)=>{
 
    if(err){
       return res.send("Error: "+err);
    }
    else{
      res.send("Admin account has been created succesfully"); 
    }


 });

});


router.post("/adminLogin", (req,res)=>{
    const {Email,Password}=req.body;

    const sql="SELECT * FROM admins WHERE Email=?";

    db.query(sql,[Email], async(err,results)=>{

        if(err) return res.send("Error");

        if(results.length===0){
            return res.send("User not found");
        }

        const admin = results[0];

        const isMatch = await  bcrypt.compare( Password,  admin.Password );
        
        if(!isMatch){
            return res.send("Incorrect Password");
        }

        req.session.admin = admin; //"Store this admin object inside the session so I can remember who is logged in."

        res.redirect("adminDashboard.html");
    });
});

//route for changing the Employee status

router.put("/admin/report/:id/status", (req,res)=>{

    const { Status } = req.body;
    const ReportId = req.params.id;

    const sql="UPDATE reports SET Status = ? WHERE ReportID = ? ";
    db.query(sql,[Status, ReportId ], (err,results)=>{
     
        if(err){
          return res.status(500).json(err);

        }
        res.send("Status Updated")

    });

});

router.get("/adminDetails",(req,res)=>{
    if(!req.session.admin){//here we are checking if then req.session.admin object is existing  even though the req.session bject might exist
      return res.send("Login first admin");//if the req.session.admin object was not found  this block of code wll be executed
    }
        const AdminID=req.session.admin.AdminID;//here we are assigning the adminID variable by invoking the adminID property using the req.session.admin object
         const sql="SELECT * FROM admins WHERE AdminID=?";
         db.query(sql,[AdminID], (err,results)=>{
        if(err){

            return res.send("Error "+err);
        }
        if(results.length==0){
            return res.send("Admin not found")

            
        }
        const admin=results[0];
        res.json(admin);//express c0nverts the admin object into json and sends it to the browser for displaying

         });

});

//router for the reports used to submit reports





/*router.post("/submittingReports",async(req,res)=>{
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

});*/

router.post("/submittingReports", (req, res) => {

    const {
        MistreatmentType,
        Description,
        OccurrenceDate,
        CompanyName,
        Status
    } = req.body;

    const UserID = req.session.user.UserID;
    const Name = req.session.user.Name;
    const Email = req.session.user.Email;

    const sql = `
    INSERT INTO reports
    (UserID, MistreatmentType, Description, OccurrenceDate, CompanyName, Status)
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [UserID, MistreatmentType, Description, OccurrenceDate, CompanyName, Status],
        async (err, result) => {

            if (err) {
                return res.send("Error: " + err);
            }

            try {

                await sendConfirmationEmail(
                    Email,
                    Name,
                    result.insertId
                );

                res.send("Your report has been submitted successfully.");

            } catch (emailError) {

                console.log(emailError);

                res.send("Report submitted successfully, but the confirmation email failed.");

            }

        }
    );

});

//router for user dashboard
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
    const user=results[0];//res.json(results); 
    delete user.Password;
    res.json(user);

});


});

//View evidence button Route//copied
router.get("/admin/evidence/:reportID",(req,res)=>{

    const reportID = req.params.reportID;
    

    const sql = `SELECT * FROM evidence WHERE ReportID = ? `;
        
    db.query(sql,[reportID],(err,results)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(results);
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

//code from chat , maybe i willdelete it

router.get("/admin/reports", (req, res) => {

    if (!req.session.admin) {
        return res.status(401).send("Please login first");
    }

    const sql = `
            SELECT
            reports.ReportID,
            reports.MistreatmentType,
            reports.Description,
            reports.OccurrenceDate,
            reports.Status,
            reports.DateSubmitted,

            users.Name,
            users.Surname,
            users.Gender

        FROM reports
        INNER JOIN users
        ON reports.UserID = users.UserID

        ORDER BY reports.DateSubmitted DESC
    `;

    db.query(sql, (err, results) => {
                                     
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results);
    });

});

//chat api for status
router.get("/admin/stats", (req,res)=>{

    if(!req.session.admin){
        return res.status(401).send("Login required");
    }

    const sql = `
        SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN Status='Submitted' THEN 1 ELSE 0 END) AS submitted,
        SUM(CASE WHEN Status='In Progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN Status='Resolved' THEN 1 ELSE 0 END) AS resolved
        FROM reports
    `;

    db.query(sql,(err,results)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(results[0]);
    });
});



module.exports=router;