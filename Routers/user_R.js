const express = require('express');
const UserRouter = express.Router();

module.exports = UserRouter;
const user_M = require("../Middleware/user_M")
const db_pool = require("../database");


UserRouter.post("/createUser", user_M.createUser,user_M.getUsers, (req, res) => {//Create
    if (req.success) {
        res.status(200).json({success: req.success, insertId: req.insertId, users: req.users});
    } else {
        res.status(500).send({success: req.success})
    }
})

UserRouter.get("/getUsers", user_M.getUsers, (req, res) => {//Read
    if (req.success) {
        res.status(200).send({success: req.success, users: req.users})
    } else {
        res.status(500).send({success: req.success})
    }
})
UserRouter.post("/getUsers", user_M.getUsers, (req, res) => {//Read
    if (req.success) {
        res.status(200).send({success: req.success, users: req.users})
    } else {
        res.status(500).send({success: req.success})
    }
})

UserRouter.put("/updateUser", user_M.updateUser, (req, res) => {//Update
    if (req.success) {
        res.status(200).send({success: req.success})
    } else {
        res.status(500).send({success: req.success})
    }
})

UserRouter.delete("/deleteUser", user_M.deleteUser, (req, res) => {// Delete
    if (req.success) {
        res.status(200).send({success: req.success})
    } else {
        res.status(500).send({success: req.success})
    }
})

UserRouter.post("/checkUser", user_M.checkUser);


