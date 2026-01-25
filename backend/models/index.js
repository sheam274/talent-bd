const User = require('./User');
const Course = require('./Course');
const Category = require('./Category');
const Job = require('./Job');

// This allows server.js to import them all as a single object
module.exports = { 
    User, 
    Course, 
    Category, 
    Job 
};