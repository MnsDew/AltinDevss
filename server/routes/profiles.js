const express = require('express');
const router = express.Router(); //express.Router is a function that creates a new router object
const {auth , upload} = require("../utils/index"); //auth is a middleware function that checks if the user is authenticated
const {check, validationResult} = require("express-validator"); //express-validator is a library for validating data
const normalize = require("normalize-url"); //normalize-url is a library for normalizing URLs
const Profile = require("../models/Profile"); //Profile is a model that stores the profile data
const User = require("../models/User"); //User is a model that stores the user data 
const Post = require("../models/Post"); //Post is a model that stores the post data

//Routes for profiles
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
 11. PUT /profiles/follow/:user_id
 12. PUT /profiles/unfollow/:user_id
 13. GET /profiles/followers
 14. GET /profiles/following  
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

   router.get('/me', auth, async(req,res) => {
  try{
      const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']); //populate the user field with the name and avatar 
    if(!profile){
      return res.status(400).json({msg: "There is no profile for this user !"});
    }
    res.json(profile);
  } catch(err){
    console.error(err.message);
    res.status(500).send("Server Error in me route" , err.message);
  }
});

    router.get('/', auth, async(req,res) => {
    try{
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch(err){
      console.error(err.message);
      res.status(500).send("Server Error in profiles route" , err.message);
    }
  });

  router.get('/user/:user_id', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
      console.log(profile);
      if(!profile){
        return res.status(400).json({msg: "There is no profile for the given user !"});
      }
      res.status(200).json({profile});
    } catch(err){
      console.error(err.message);
      res.status(500).send("Server Error in user route" , err.message);
    }
  });

        router.delete("/", auth, async (req,res) => {

          try{
         await Promise.all(
          [
            Post.deleteMany({user: req.user.id}),
            Profile.findOneAndDelete({user: req.user.id}),    
            User.findOneAndDelete({_id: req.user.id}),
            
          ]

         );
         res.json({msg: "User deleted successfully"});
          }catch(err){
            console.error(err.message);
            res.status(500).send("Server Error in delete route" , err.message);
          }

        } )


        router.post('/upload', auth, async(req,res) => {

      try{
        
        upload(req, res, async(err) =>{
          if(err){
            return res.status(500).send("Server Error" , err.message)
          } else {
            res.status(200).json({msg: "Image uploaded successfully" , image: req.file.filename})
          }

        });

      } catch(err){
        console.error(err.message);
        res.status(500).send("Server Error" , err.message);
      }
    } 
  )

  router.put('/experience', 
    auth , 
    check("title", "Title is required").notEmpty(), 
    check("company", "Company is required").notEmpty(), 
    check("from", "From date is required and must be in the past")
    .notEmpty()
    .custom((value, {req}) => {
    return req.body.to ? value < req.body.to : true;
    }),
    async(req,res) => {
    const errors = validationResult(req); 
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()});
    }    

    try{
      const profile = await Profile.findOne({user: req.user.id});
      profile.experience.unshift(req.body); //add the experience to the beginning of the array by using unshift
      await profile.save();
      res.json(profile);

    } catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
  }
);  

        router.delete('/experience/:exp_id', auth, async(req,res) => {
        try{
          const profile = await Profile.findOne({user: req.user.id}); //find the profile of the user
          profile.experience = profile.experience.filter(exp => {  //filter out the experience that is not the one we want to delete
            return exp._id.toString() !== req.params.exp_id;
          });  
          await profile.save();
          res.json(profile);
        }  catch(err){
        console.error(err.message);
        res.status(500).send("Server Error" , err.message);
      } 
    }   
  );

  router.put('/education', auth, 
    check("school", "School is required").notEmpty(),
    check("degree", "Degree is required").notEmpty(),
    check("fieldofstudy", "Field of study is required").notEmpty(),
    check("from", "From date is required and must be in the past")
    .notEmpty()
    .custom((value, {req}) => {
    return req.body.to ? value < req.body.to : true;
    }),
          async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()});
    }  

  try{
    const profile = await Profile.findOne({user: req.user.id});
    profile.education.unshift(req.body); //add the education to the beginning of the array by using unshift
    await profile.save();
    res.json(profile);

  } catch(err){
    console.error(err.message);
    res.status(500).send("Server Error" , err.message);
  }
}
); 


  router.delete('/education/:edu_id', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.user.id});
      profile.education = profile.education.filter(edu => {
        return edu._id.toString() !== req.params.edu_id;
      });
      await profile.save();
      res.json(profile);

    } catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
  }
);

  router.put('/follow/:user_id', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.user.id});
      profile.following.unshift({user: req.params.user_id}); //add the user id to the following array by using unshift
      await profile.save();
      res.json(profile);
      } catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
  }
);

  router.put('/unfollow/:user_id', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.user.id});
      profile.following = profile.following.filter(user => user.user.toString() !== req.params.user_id); //filter out the user id from the following array
      await profile.save();
      res.json(profile);
      } catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
  }
);

  router.get('/followers', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.user.id});
      res.json(profile.followers);
    }
    catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
  }
);

  router.get('/following', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.user.id});
      res.json(profile.following);
    }
    catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
    }
);

    router.get('/followers/:user_id', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.params.user_id});
      res.json(profile.followers);
    }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error" , err.message);
  }
  }
);

  router.get('/following/:user_id', auth, async(req,res) => {
    try{
      const profile = await Profile.findOne({user: req.params.user_id});
      res.json(profile.following);
    }
    catch(err){
      console.error(err.message);
      res.status(500).send("Server Error" , err.message);
    }
  }
);
    
    


  module.exports = router;  