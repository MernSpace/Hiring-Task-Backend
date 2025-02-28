// Basic Lib Import
const express =require('express');
const router =require('./src/routes/api');
const app= new express();
const bodyParser =require('body-parser');

// Security Middleware Lib Import
const rateLimit =require('express-rate-limit');
const helmet =require('helmet');
const mongoSanitize =require('express-mongo-sanitize');
const xss =require('xss-clean');
const hpp =require('hpp');
const cors =require('cors');

// Database Lib Import
const mongoose =require('mongoose');

// Security Middleware Implement
app.use(cors({
    origin: "https://hire-task-frontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));



// Body Parser Implement
app.use(bodyParser.json())

require('dotenv').config();
// Request Rate Limit
const limiter= rateLimit({windowMs:15*60*1000,max:3000})
app.use(limiter)


const local = 'mongodb://localhost:27017/auth'
let Option = { user: process.env.USER, pass: process.env.PASSWORD, autoIndex: true, useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(process.env.MNGOBD_URL,Option)
    .then(() => {
        console.log('Connection Success');
    })
    .catch((error) => {
        console.error('Connection Error:', error);
    });




// Routing Implement
app.use("/api/v1",router)

// Undefined Route Implement
app.use("*",(req,res)=>{
    res.status(404).json({status:"fail",data:"Not Found"})
})


module.exports=app;
















