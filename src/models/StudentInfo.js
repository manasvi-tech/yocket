const mongoose = require('mongoose');
const passport = require('passport');
const validator = require('validator');


const studentInfoSchema = mongoose.Schema({
    firstname:{
        type:String,
        required:[true, "Please enter the name of the student"]
    },

    lastname:{
        type:String,
        required:false
    },

    email:{
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please enter correct Email")
            }
        },
        unique:false
    },

    degree:{
        type:String,
        enum:['bachelor','master'],
        required:[true, "please tell us about the degree you wish to pursue"]
    },
    course:{
        type: String,
        required: [true, "Please enter area of interest"]
    }
})

const StudentInfo = new mongoose.model("StudentInfo", studentInfoSchema);

module.exports = StudentInfo