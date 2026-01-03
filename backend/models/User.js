const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedCV: {
        name: String,
        email: String,
        phone: String,
        summary: String,
        profileImage: String,
        LinkedIn: String,
        nationality: String,
        dob: String,
        maritalStatus: String,
        skills: [{ name: String, level: String }],
        experience: [{ 
            company: String, 
            role: String, 
            period: String, 
            achievements: String,
            location: String,
            website: String
        }],
        projects: [{ title: String, link: String, desc: String }],
        education: [{ 
            degree: String, 
            institute: String, 
            year: String, 
            result: String 
        }],
        references: [{ name: String, company: String, phone: String }]
    }
});

module.exports = mongoose.model('User', UserSchema);