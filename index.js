require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwtauth = require('./src/middleware/jwtauth')

const app = express();
app.use(session({ secret: "cats" }))
const path = require('path');
require("./src/db/conn");
const hbs = require('hbs');
const { engine } = require('express-handlebars');
const methodOverride = require("method-override");  // DELETE AND UPDATE REQUEST CANT BE MADE DIRECTLY THUS THIS
require('./src/middleware/auth')
const User = require('./src/models/User');
const StudentInfo = require('./src/models/StudentInfo');
const passport = require('passport')
const jwt = require('jsonwebtoken');
const { register } = require('module');


const templatePath = path.join(__dirname, "/templates/views");
const partialsPath = path.join(__dirname, "/templates/partials");
const staticPath = path.join(__dirname, "/public"); //CLIENT SIDE CODE IS HERE


// Setting up the Handlebars view engine with Express
app.engine('handlebars', engine());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse cookies from incoming requests
app.use(cookieParser());

// Setting the default view engine to Handlebars
app.set("view engine", "hbs");

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));

// Serving static files from the specified directory
app.use(express.static(staticPath));

// Setting the path for the views directory
app.set("views", templatePath);

// Registering Handlebars partials to allow for reusable code blocks
hbs.registerPartials(partialsPath);

// Initializing Passport for authentication
app.use(passport.initialize());

// Enabling persistent login sessions with Passport
app.use(passport.session());


function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

// home page
app.get('/',  (req, res) => {
    res.render("index");
})


// get signup page
app.get('/signup', (req, res) => {
    res.render('signup');

})


// signup request
app.post('/signup', async (req, res) => {
    try {

        if (req.body.password != req.body.cpassword) {
            return res.status(400).send("Password and confirm password do not match.");
        }

        const exists = await User.findOne({ email: req.body.email });
        
        // user already exists in the database
        if (exists) {
            return res.status(400).send("You already have an account. Please login.");
        }

        const registerUser = new User({
            email: req.body.email,
            password: req.body.password,
            studentInfo: null // Set studentInfo to null initially
        });

        // generating a token
        const token = await registerUser.generateToken();
        res.cookie("jwt", token);

        // saving the user into database
        const registered = await registerUser.save();

        // redirecting for setup of user profile
        res.redirect('/setup');

    } catch (err) {
        console.log("Error fetching details", err);
        res.status(400).send("There is an error: " + err.message);
    }
});

// login request
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userEmail = await User.findOne({ email });
        
        // email not found in database
        if (!userEmail) {
            return res.status(400).send("Please register");
        }


        // wrong password
        const isMatch = await bcrypt.compare(password, userEmail.password);
        if (!isMatch) {
            return res.status(400).send("Please enter the right credentials");
        }

        // Generate a JWT for the user
        const token = await userEmail.generateToken();
        console.log("Generated token: ", token);

        // Set the expiration date for the cookie
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 5); // Set the expiration date to 5 days from now

        // Set the cookie
        res.cookie("jwt", token, {
            expires: expirationDate,
            httpOnly: true,
        });

        // Redirect to the feed after successful login
        res.redirect('/feed');

    } catch (err) {
        console.error("Error during login: ", err);
        res.status(500).send("Internal Server Error");
    }
});


// getting feed page but checking beforehand if the user is authenticated or not using middleware
app.get('/feed',jwtauth, async(req,res)=>{

    // populating through studentInfo Object
    const userDetails = await req.user.populate('studentInfo')

    res.render('feed',{
        user: userDetails
    })
})


app.get('/logout', jwtauth, async (req, res) => {
    try {
        // removing the cookie
        res.clearCookie("jwt");
        await req.user.save();

        res.render('index');

    } catch (err) {
        res.status(500).send(err)
    }
})

// visits google page. Passport.autenticate triggers the googl oAuth strategy. 
// here we are requesting email and profile
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    function (req, res) {
        // At this point, `req.user` contains the authenticated user and token
        if (req.user && req.user.token) {
            // Set the JWT token in a cookie
            res.cookie("jwt", req.user.token);
            console.log("Token:", req.user.token);
            console.log("Cookie made");
            res.redirect('/setup'); // Redirect to the locked page after login
        } else {
            // Handle the case where there is no user or token
            console.error("Authentication failed. No user or token.");
            res.redirect('/auth/failure');
        }
    }
);

// profile for setting up
app.get('/setup', (req, res) => {
    res.render('setup')
})

// setup request
app.post('/setup', jwtauth, async(req,res)=>{
    const userid = req.user._id;
    console.log(req.body.selectedDegree);
    

    const registerStudentInfo = new StudentInfo({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        degree:req.body.selectedDegree,
        course:req.body.course
    })

    const student = await registerStudentInfo.save();
    
    const user = await User.findOne({_id:userid})

    // if no user student info exists
    if (!user.studentInfo || user.studentInfo.toString() !== student._id.toString()) {
        user.studentInfo = student._id; // Set studentInfo to the new student's ObjectId
        await user.save();
    }

    await user.save();
    res.redirect('/feed')


})

app.get('/auth/failure', (req, res) => {
    res.redirect("/signup");
})

app.get('/protected', isLoggedIn, (req, res) => {
    res.render('setup');
})


app.listen(3000, () => {
    console.log("Listening on port 3000")
})
