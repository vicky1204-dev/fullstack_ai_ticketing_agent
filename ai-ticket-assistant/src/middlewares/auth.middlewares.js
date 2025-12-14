import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyToken = async (req, res, next) =>{
    const token = req.cookies.token || req.header("Authorization").split(1)
    if(!token) return res.status(401).json({error: "Unauthorized"})

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken._id).select("-password")
        if(!user) return res.status(401).json({error: "Unauthorized"})
        req.user = user
    next()
    } catch (error) {
        throw new ApiError(401, "Invalid token"); 
    }
}