const UsersModel = require("../models/UsersModel");
const jwt = require("jsonwebtoken");
const OTPModel = require("../models/OTPModel");
const SendEmailUtility = require("../utility/SendEmailUtility");
const bcrypt = require("bcrypt");

// Registration
exports.registration = async (req, res) => {
    try {
        let reqBody = req.body;

        // Check if password is provided
        if (!reqBody.password) {
            return res.status(400).json({ status: "fail", data: "Password is required" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(reqBody.password, saltRounds);

        // Replace plain password with hashed password
        reqBody.password = hashedPassword;

        // Save user in database
        const newUser = await UsersModel.create(reqBody);
        res.status(201).json({ status: "success", data: newUser });

    } catch (err) {
        res.status(500).json({ status: "fail", error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log(password)

        // Find user by email
        const user = await UsersModel.findOne({ email });
        console.log(user)

        if (!user) {
            return res.status(401).json({ status: "unauthorized", data: "Invalid email or password" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(401).json({ status: "unauthorized", data: "Invalid email or password" });
        }

        // Generate JWT token
        let payload = { exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, data: user.email };
        let token = jwt.sign(payload, "SecretKey123456789");

        // Send response (exclude password)
        res.status(200).json({
            status: "success",
            token: token,
            data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                photo: user.photo,
            },
        });

    } catch (err) {
        res.status(500).json({ status: "fail", error: err.message });
    }
};

exports.profileUpdate = async (req, res) => {
    try {
        let email = req.headers["email"];
        let reqBody = req.body;

        if (!email) {
            return res.status(400).json({ status: "fail", data: "Email header is required" });
        }

        // If password is being updated, hash it before saving
        if (reqBody.password) {
            const saltRounds = 10;
            reqBody.password = await bcrypt.hash(reqBody.password, saltRounds);
        }

        // Update user profile
        const updatedUser = await UsersModel.findOneAndUpdate(
            { email: email },
            { $set: reqBody },
            { new: true, projection: { password: 0 } } // Exclude password from response
        );

        if (!updatedUser) {
            return res.status(404).json({ status: "fail", data: "User not found" });
        }

        res.status(200).json({ status: "success", data: updatedUser });

    } catch (err) {
        res.status(500).json({ status: "fail", error: err.message });
    }
};


exports.profileDetails=(req,res)=>{
    let email= req.headers['email'];
    UsersModel.aggregate([
        {$match:{email:email}},
        {$project:{_id:1,email:1,firstName:1,lastName:1,mobile:1,photo:1,password:1}}
    ],(err,data)=>{
        if(err){
            res.status(400).json({status:"fail",data:err})
        }
        else {
            res.status(200).json({status:"success",data:data})
        }
    })
}

exports.RecoverVerifyEmail=async (req,res)=>{
    let email = req.params.email;
    let OTPCode = Math.floor(100000 + Math.random() * 900000)
    try {
        // Email Account Query
        let UserCount = (await UsersModel.aggregate([{$match: {email: email}}, {$count: "total"}]))
        if(UserCount.length>0){
            // OTP Insert
            let CreateOTP = await OTPModel.create({email: email, otp: OTPCode})
            // Email Send
            let SendEmail = await SendEmailUtility(email,"Your PIN Code is= "+OTPCode,"Task Manager PIN Verification")
            res.status(200).json({status: "success", data: SendEmail})
        }
        else{
            res.status(200).json({status: "fail", data: "No User Found"})
        }

    }catch (e) {
        res.status(200).json({status: "fail", data:e})
    }

}




exports.RecoverVerifyOTP=async (req,res)=>{
    let email = req.params.email;
    let OTPCode = req.params.otp;
    let status=0;
    let statusUpdate=1;
    try {
        let OTPCount = await OTPModel.aggregate([{$match: {email: email, otp: OTPCode, status: status}}, {$count: "total"}])
        if (OTPCount.length>0) {
            let OTPUpdate = await OTPModel.updateOne({email: email, otp: OTPCode, status: status}, {
                email: email,
                otp: OTPCode,
                status: statusUpdate
            })
            res.status(200).json({status: "success", data: OTPUpdate})
        } else {
            res.status(200).json({status: "fail", data: "Invalid OTP Code"})
        }
    }
    catch (e) {
        res.status(200).json({status: "fail", data:e})
    }
}



exports.RecoverResetPass=async (req,res)=>{

    let email = req.body['email'];
    let OTPCode = req.body['OTP'];
    let NewPass =  req.body['password'];
    let statusUpdate=1;

    try {
        let OTPUsedCount = await OTPModel.aggregate([{$match: {email: email, otp: OTPCode, status: statusUpdate}}, {$count: "total"}])
        if (OTPUsedCount.length>0) {
            let PassUpdate = await UsersModel.updateOne({email: email}, {
                password: NewPass
            })
            res.status(200).json({status: "success", data: PassUpdate})
        } else {
            res.status(200).json({status: "fail", data: "Invalid Request"})
        }
    }
    catch (e) {
        res.status(200).json({status: "fail", data:e})
    }
}


























