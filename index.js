const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const user = require('./models/User');
var bodyParser = require('body-parser');
const app = express();
const auth = require('./middleware/auth');
var CryptoJS = require("crypto-js");
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Ensure that the browser supports the service worker API
if (navigator.serviceWorker) {
    // Start registration process on every page load
    window.addEventListener('load', () => {
        navigator.serviceWorker
            // The register function takes as argument
            // the file path to the worker's file
            .register('/service_worker.js')
            // Gives us registration object
            .then(reg => console.log('Service Worker Registered'))
            .catch(swErr => console.log(
                    `Service Worker Installation Error: ${swErr}}`));
        });
    }
    

mongoose
  .connect(
    'mongodb+srv://root:root@cluster0.2lglfc8.mongodb.net/noapp?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log("Database connection established");
  });

app.set("view engine","hbs");

app.get("/", (req, res) => {
    res.render("login")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/upload", (req, res) => {
    res.render("upload")
})

app.post("/", async (req, res,next) => {
    const { email, password } = req.body;
        let user_data = await user.findOne({ email })

        if (user_data) {
            console.log('anshika login');
            const bytes = CryptoJS.AES.decrypt(user_data.password, "secret123");
            let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
            if (email == user_data.email && password == decryptedPassword) {
                var token = jwt.sign({ email: user_data.email }, 'jwtsecret', { expiresIn: "2d" });
                res.status(200).json({ success: true, token })
                res.status(200).render("upload");
            }
            res.status(200).json({ success: false, error: "Invalid Credentials" })
        }
        else {
            res.status(200).json({ success: false, error: "No User found" })
        }
})

app.post("/signup", async (req, res) => {
        console.log('anshika');
        const {email, password} = req.body;
        let u = new user({ email, password: CryptoJS.AES.encrypt(req.body.password, "secret123").toString() })
        await u.save()
        var token = jwt.sign({ email: u.email }, 'jwtsecret', { expiresIn: "2d" });
        //sres.status(200).json({ success: "success" })
        res.render("login");
})

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}`);
});