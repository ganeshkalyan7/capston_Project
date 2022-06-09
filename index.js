const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors')

mongoose.connect('mongodb+srv://ganeshkalyan:ganeshcristiano@cluster0.9ib1a.mongodb.net/?retryWrites=true&w=majority').then(
    () => {
        console.log("DB connected")
    }
)
app.use(express.json());
app.use(cors({ origin: "*" }))


//registering of form 
app.post('/register', async (req, res) => {
    try {
        const { usersname, email, password, confirmpassword } = req.body;
        let exist = await Registeruser.findOne({ email });
        if (exist) {
            return res.status(400).send('user already exist')
        }

        if (password !== confirmpassword) {
            return res.status(400).send('password doesnt match')
        }
        let newUser = new Registeruser({
            usersname,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
        res.status(200).send('registered successfully')
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('internal servar error')

    }



})


//login of the form 
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let exist = await Registeruser.findOne({ email })
        if (!exist) {
            return res.status(400).send("user not found")
        }
        if (exist.password !== password) {
            return res.status(400).send('invalid credentials')
        }


        let payload = {
            user: {
                id: exist.id
            }
        }

        jwt.sign(payload, "jwtsecret", { expiresIn: 360000000 },
            (err, token) => {
                if (err) throw err
                return res.json({ token })
            }
        )

    }
    catch (err) {
        console.log(err)
        return res.status(500).send('internal servar error')

    }


})


//accessing the profile route
app.get('/myprofile', middleware, async (req, res) => {
    try {
        let exist = await Registeruser.findById(req.user.id);
        if (!exist) {
            return res.status(400).send('not found')
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('internal servar error')

    }

})

// listening to the port 
app.listen(4000, () => {
    console.log("server started on port number 4000")
})