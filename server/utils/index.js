const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation    
require("dotenv").config();
 //dotenv is a library for loading environment variables from a .env file
const auth = (req, res, next) => {

    // Get token from header
    const token = req.header("x-auth-token");

    // Check if no token
    if(!token){
        return res.status(401).json({msg: "No token available, authorization denied"});
    }

    // Verify token
    try {
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if(error){
                return res.status(401).json({msg: "Token is not valid , authorization denied"});
        
        } else {
            req.user = decoded.user; 
            next(); //to move to the next middleware , very important
        }
    });
} catch (err) {
    res.status(401).json({msg: "Token is not valid , authorization denied"}); //401 error is for unauthorized access
}
}

module.exports = {auth};