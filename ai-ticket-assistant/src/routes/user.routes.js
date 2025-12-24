import express from "express"
import { userSignup, login, logout, getUsers, updateUser } from "../controllers/user.controllers.js"
import {verifyToken} from "../middlewares/auth.middlewares.js"

export const userRouter = express.Router()

userRouter.route("/signup").post(userSignup)
userRouter.route("/login").post(login)
userRouter.route("/logout").get(logout)

//secures routes
userRouter.route("/getusers").get(verifyToken, getUsers)
userRouter.route("/update-users").post(verifyToken, updateUser)