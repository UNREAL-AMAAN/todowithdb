const { UserModel, TodoModel } = require("./db");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const validator = require("validator");

const { z } = require("zod");

const { auth, JWTSECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
mongoose.connect(
    "mongodb+srv://amaan1:Amaansyed2005@mycluster.gl31z.mongodb.net/todo-db"
);

app.use(express.json());

app.post("/signup", async (req, res) => {
    const req_schema = z.object({
        email: z.string().email(),
        password: z.string().min(8).max(20),
        name: z.string(),
    });

    const valid_email = validator.isEmail(req.body.email);
    if (!valid_email) {
        return res.status(400).json({ message: "Invalid email" });
    }

    const options = {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    };
    const valid_password = validator.isStrongPassword(
        req.body.password,
        options
    );
    if (!valid_password) {
        return res.json({
            message: "Invalid password",
        });
    }

    // const parsed = req_schema.parse(req.body);
    const safeparsed = req_schema.safeParse(req.body);

    if (!safeparsed.success) {
        return res
            .status(400)
            .json({ message: "Invalid request", error: safeparsed.error });
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const hashed_pw = await bcrypt.hash(password, 5);
    console.log(hashed_pw);
    console.log("->creds received\n");
    try {
        await UserModel.create({
            email: email,
            password: hashed_pw,
            name: name,
        });
    } catch (err) {
        res.status(400).json({
            message: "User already exists !",
        });
        return;
    }
    console.log("->creds inserted\n");
    res.json({
        message: "Signup Successful !",
    });
});
app.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log("creds received\n");
    const user = await UserModel.findOne({
        email: email,
    });

    if (!user) {
        res.status(401).json({
            message: "Incorrect Credentials !",
        });
        return;
    }
    const pw_check = await bcrypt.compare(password, user.password);

    console.log(user);
    if (pw_check) {
        console.log("creds verified\ncorrect creds\n");
        const token = jwt.sign(
            {
                id: user._id.toString(),
            },
            JWTSECRET
        );
        res.status(200).json({
            token: token,
            message: "Signin Successful !",
        });
    } else {
        console.log("creds not verified\nIncorrect creds\n");
        res.status(401).json({
            message: "Incorrect Credentials !",
        });
    }
});

app.post("/todo", auth, (req, res) => {
    const userId = req.id;
    const task = req.body.task;
    console.log(task);
    if (!task) {
        res.status(400).json({
            message: "Task cannot be empty !",
        });
    } else {
        TodoModel.create({
            userId: userId,
            title: task,
            done: false,
        });
        console.log("task added successfully !");
        res.status(200).json({
            message: "Task added successfully !",
        });
    }
});
app.get("/get-todos", auth, async (req, res) => {
    const userId = req.id;
    console.log("fetching todos");
    const user = await TodoModel.find({
        userId: userId,
    });
    console.log("fetching completed");
    if (user.length == 0) {
        res.status(404).json({
            message: "No todos found !",
        });
        console.log("todos not found");
    } else {
        res.status(200).json({
            todos: user,
            message: "todos fetched successfully !",
        });
        console.log("todos response sent");
    }
});

app.listen(3000);
