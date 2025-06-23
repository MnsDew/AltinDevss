const express = require('express');
const router = express.Router(); //express.Router is a function that creates a new router object
const {auth} = require("../utils/index"); //auth is a middleware function that checks if the user is authenticated
const {check, validationResult} = require("express-validator"); //express-validator is a library for validating data
const normalize = require("normalize-url"); //normalize-url is a library for normalizing URLs
const Profile = require("../models/Profile"); //Profile is a model that stores the profile data
/*
 1. POST /profiles
 2. GET /profiles/me
 3. GET /profiles
 4. GET /profiles/user/:user_id
 5. DELETE /profiles
 6. POST /profiles/upload
 7. PUT /profiles/experience
 8. DELETE /profiles/experience/:exp_id
 9. PUT /profiles/education
 10. DELETE /profiles/education/:edu_id
*/




router.post('/',
  auth,
  check("status", "Status is required").not().isEmpty(),
  check("skills", "Skills are required").not().isEmpty(),
  async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()});
    }

    /*
    "company" : "Aramix",
    "website" : "https://www.aramix.com",
    "location" : "New York, NY",
    "status" : "Software Engineer",
    "skills" : ["JavaScript", "React", "Node.js", "MongoDB"],
    "bio" : "I am a software engineer with a passion for building web applications",
    "githubusername" : "aramix",
    "twitter" : "https://www.twitter.com/aramix",
    "instagram" : "https://www.instagram.com/aramix",
    "linkedin" : "https://www.linkedin.com/in/aramix",
    "facebook" : "https://www.facebook.com/aramix",
    "youtube" : "https://www.youtube.com/aramix",
    */
    const {website,skills,youtube,twitter,instagram,linkedin,facebook,github, ...rest} = req.body;
    const profile = {
      user: req.user.id,
      website: website !== "" ? normalize(website, {forceHttps: true}) : "",
      skills: Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim()),
      ...rest //split the skills string into an array , and trim for any extra spaces
    };
      const socialFields = {youtube,twitter,instagram,linkedin,facebook,github};
      for(let key in socialFields){
        const value = socialFields[key];
        if(value && value !== ""){
          socialFields[key] = normalize(value, {forceHttps: true});
        }
      }
      profile.social = socialFields; //add the social fields to the profile

      try{
        let profileObject = await Profile.findOneAndUpdate(
          {user: req.user.id},
           {$set: profile}, 
           {new: true, upsert: true});

        if(profileObject){
          return res.json(profileObject);
        }
        else{
          return res.status(400).json({msg: "Profile not found"});
        }
      }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error" , err.message);
      }
    
});   





module.exports = router;  