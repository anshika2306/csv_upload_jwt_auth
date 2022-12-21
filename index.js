const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const user = require('./models/User');
var bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const csvModel=require('./models/CsvModel');

const app = express();
const auth = require('./middleware/auth');
var CryptoJS = require("crypto-js");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadedFiles/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
//create multer instance
var upload = multer({ storage: storage })

mongoose
    .connect(
        'mongodb+srv://root:root@cluster0.2lglfc8.mongodb.net/noapp?retryWrites=true&w=majority'
    )
    .then(() => {
        console.log("Database connection established");
    });

app.set("view engine", "hbs");

function add_data_to_database(data){
    let arr = data.split('\n')
    for(let i = 1; i < arr.length; i++){
        let row = arr[i].split(',');
        console.log(row)
        let csv_data = new csvModel({
            name:row[0],
            phone:row[1],
            email:row[2],
            linkedin:row[3]
        });
        
        (async ()=>{ 
            await csv_data.save();
        })();
    }
}

app.get("/", (req, res) => {
    res.render("login")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/uploadfile", (req, res) => {
    res.render("uploadfile")
})

app.post("/", async (req, res, next) => {
    const { email, password } = req.body;
    let user_data = await user.findOne({ email })

    if (user_data) {
        console.log('anshika login');
        const bytes = CryptoJS.AES.decrypt(user_data.password, "secret123");
        let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        if (email == user_data.email && password == decryptedPassword) {
            var token = jwt.sign({ email: user_data.email }, 'jwtsecret', { expiresIn: "2d" });
            // res.status(200).json({ success: true, token })
            res.status(200).render("uploadfile");
        }
        else {
            res.status(200).json({ success: false, error: "Invalid Credentials" });
            return;
        }

    }
    else {
        res.status(200).json({ success: false, error: "No User found" })
    }
})

app.post("/signup", async (req, res) => {
    console.log('anshika');
    const { email, password } = req.body;
    let existingUser = await user.findOne({ email });
    if (!existingUser) {
        let u = new user({ email, password: CryptoJS.AES.encrypt(req.body.password, "secret123").toString() })
        await u.save()
        var token = jwt.sign({ email: u.email }, 'jwtsecret', { expiresIn: "2d" });
        //res.status(200).json({ success: "success" })

        res.render("login");
    }
    else {
        res.render("login");
    }
})

app.post('/uploadfile', upload.single('file'), async function (req, res, next) {  
    let data = fs.readFileSync(req.file.path).toString();
    add_data_to_database(data);
    res.status(200).send({'message' : "file uploaded"});
  })

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}`);
});