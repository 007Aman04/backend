import express, { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fetchUser from "../middlewares/fetchUser.js";
const router = express.Router();

router.post(
    "/register",
    [
        body("name", "Enter a valid name").isLength({ min: 3 }),
        body("email", "Enter a valid email").isEmail(),
        body("password").isLength({ min: 5 }),
    ],
    async (req, res) => {
        console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res
                    .status(400)
                    .send("Sorry a user with same email already exists");
            }

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hash,
            });
            res.json(user);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Some error occured");
        }
    }
);

router.post(
    "/login",
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password can't be empty").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).send("Enter valid credentials");
            }

            var isMatch = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (!isMatch) {
                return res.status(400).send("Enter valid credentials");
            }

            const accessToken = jwt.sign({ id: user._id }, "secretkey");
            return res.json({ accessToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Some error occured");
        }
    }
);

router.post("/getuser", fetchUser, async (req, res) => {
    try {
        const id = req.id;
        const user = await User.findById(id).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

export default router;
