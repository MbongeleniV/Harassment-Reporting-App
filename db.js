const mysql=require("mysql2");
const db=mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"MbongeleniSystems",
    database:"worksafedesk"

});

db.connect(err =>{

if(err){
    console.log("Couldnt connect to mysql");
}
else{
    console.log("Connected to Mysql");
}

});


module.exports=db;