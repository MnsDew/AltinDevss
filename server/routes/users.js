const express = require('express');
const router = express.Router(); 
const {check, validationResult} = require("express-validator"); //express-validator is a library for validating data
const User = require("../models/User"); //User is a model for the user collection in the database
const bcrypt = require("bcryptjs"); //bcryptjs is a library for hashing passwords
const jwt = require("jsonwebtoken"); //jsonwebtoken is a library for creating and verifying tokens
require("dotenv").config(); //dotenv is a library for loading environment variables from a .env file
const {auth} = require("../utils/index");

//three APIs for users
//1. register
//2. login
//3. get user data

/* Steps: 
    Get user input or request body
    Validate input or request body
    check if user exists, if yes, return error
    Hash password or encrypt password
    Save user to database or create user
    Return jsonwebtoken (JWT) 
    using JWT secret key to create a token containing user id , return token to client

    
    EXTRA:
    client stores token in local storage or session storage
    client sends token in Authorization header of every request
    server validates token
    server returns user data
    if token is not valid, server returns error
    if token is expired, server returns error
    if token is not valid, server returns error
*/

/* PATH:  /api/users/register 
    dESC : register a new user 
    Public */

router.post("/register",
    
    check("name" , "name is required! ").notEmpty(),
    check("email" , "please include a valid email").isEmail(),
    check("password" , "please enter a password with 6 or more characters").isLength({min: 6}),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const {name, email, password} = req.body;

        try {
            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // Create new user
            user = new User({
                name,
                email,
                password
            });

            // Hash password
            const salt = await bcrypt.genSalt(10); //genSalt is a method that generates a salt for the password
            user.password = await bcrypt.hash(password, salt);

            // Save user to database
            await user.save();

            // Create JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send(err.message);
        }
    });

 
 // login
/* PATH:  /api/users/login 
    dESC : login an existing user 
    Public */
 
router.post("/login",
    
    check("email" , "please include a valid email").isEmail(),
    check("password" , "please enter a password with 6 or more characters").isLength({min: 6}),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const {email, password} = req.body;

        try {
            // Check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password); //to compare the entered password with the password in the database
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

           // Create JWT token
            const payload = {
                user: {
                    id: user.id
                }
            }; 

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).json({msg: "Server error"});
        }
    });



   /* PATH:  GET /api/users 
    DESC : takes the token from the client 
    and returns the user data 
    Private */

router.get("/", auth, async (req, res) => { //auth is a middleware that checks if the user is logged in
    try {
        const user = await User.findById(req.user.id).select("-password"); // -password is to exclude the password from the user data
        res.json(user); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;