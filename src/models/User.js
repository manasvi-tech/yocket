const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please enter correct Email")
            }
        },
        unique:false
    },

    password:{
        type:String,
        required:false
    }, 
    
    studentInfo : {
        type:Schema.Types.ObjectId,
        ref:"StudentInfo"
    },

    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.generateToken = async function () {
    console.log(process.env.SECRET_KEY)
    const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
    this.tokens = this.tokens.concat({ token: token })
    await this.save();
    return token;
}

userSchema.pre("save", async function (next) {
    // Only hash the password if it is present(not in google oauth) and has been modified
    if (this.password && this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next(); // Ensure that save continues
});


const User = new mongoose.model("User",userSchema)

module.exports = User;