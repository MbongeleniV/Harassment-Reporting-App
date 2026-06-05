const express=require("express");
const bodyparser=require("body-parser");
const session=require("express-session");
const app=express();

app.use(express.json());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(session({
 
    secret:"secret123",
    resave:false,
    saveUninitialized:true


}));

app.use("/", require ("./routes/auth"));

app.listen(4000, ()=>{

const PORT=4000;
console.log("we are live at http://localhost:"+PORT);

});