const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User')
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/google/callback"
},
async function(accessToken, refreshToken, profile, done) {
  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      // If the user doesn't exist, create a new user
      user = new User({
        email: profile.emails[0].value,
        password: null,  // No password for Google Auth users
        studentInfo: null // Set studentInfo to null initially
      });
      await user.save();
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY);
    console.log("token made")

    // Pass the user and token to the next step
    return done(null, { user, token });
  } catch (err) {
    console.error("Error finding or creating user", err);
    return done(err, null);
  }
}
));


passport.serializeUser(function (user, done) {
  done(null, user);
})
passport.deserializeUser(function (user, done) {
  done(null, user);
})

