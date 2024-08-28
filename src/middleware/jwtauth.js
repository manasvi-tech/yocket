const jwt = require('jsonwebtoken');
const User = require("../models/User");

const auth = async (req,res,next) => {

    try{    
        const token = req.cookies.jwt;

        if(!token){
            return res.redirect('/signup');
        }
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY); 

        const user = await User.findOne({_id:verifyUser._id}) //getting the details of that user
        
        req.token = token;
        req.user = user;
        next();
    } 
    catch(err){
        console.log({Error:"Error in jwt authentication"})
        res.redirect('/signup')
    }
}

module.exports = auth;