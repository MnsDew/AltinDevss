const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", //ref is to link the profile to the user
    },
    company: {
        type: String,
    },
    website: {
        type: String,
    },
    country: {
        type: String,
    },
    location: {
        type: String,
    },
    status: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        required: true,
    },
    bio: {
        type: String,
    },
     experience: [ //experience is an array of objects
        {
            title: {
                type: String,
                required: true,
            }, 
            company: {
                type: String,   
                required: true,
            },
            location: {
                type: String,
            },
            from: { 
                type: Date,
                required: true,
            },
            to: {
                type: Date,
            },  
            current: {
                type: Boolean,
                default: false,
            },
            description: {
                type: String,
            },
        },
     ],
     education: [
        {
                school: {
                type: String,
                required: true,
            },
            degree: {
                type: String,
                required: true,
            },
            fieldofstudy: {
                type: String,   
                required: true,
            },  
            from: {
                type: Date,
                required: true,
            },
            to: {
                type: Date,
            },      
            current: {
                type: Boolean,
                default: false,
            },
            description: {
                type: String,
            },
        }
    ],
    social: { //social is an object of objects
        youtube: {
            type: String,
        },
        twitter: {
            type: String,
        },
        facebook: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        instagram: {
            type: String,
        },
        github: {
            type: String,
        },
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = Profile = mongoose.model("profile", ProfileSchema); //profile is the name of the collection in the database 
                                                                    // and ProfileSchema is the schema for the profile collection