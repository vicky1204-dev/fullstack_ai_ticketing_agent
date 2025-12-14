import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { inngest } from "../../inngest/client.js";

export const userSignup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) throw new Error("User already exists");

    const createdUser = await User.create({
      email,
      password,
      skills,
    });

    // trigger inngest event

    await inngest.send({
      event: "user/signup",
      data: {
        email,
      },
    });

    const user = await User.findById(createdUser._id).select("-password");
    if (!user)
      throw new Error(
        "Something went wrong while user registration, cant find the registered user"
      );

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPassValid = await User.isPasswordValid(password);
    if (!isPassValid)
      return res.status(401).json({ error: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    return res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized token" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) return res.status(401).json({ error: "Unverified token" });
    });

    return res.json({message: "Logout success"})
  } catch (error) {
     res.status(500).json({ error: "Logout failed", message: error.message });
  }
};

export const updateUser = async (req, res) => {
    const {skills = [], email, role} = req.body
    try {
        if(req.user?.role !== "admin") return res.status(403).json({error: "Forbidden"})
        const user = await User.findOne({email})
    if(!user) return res.status(401).json({error: "User not found"})

        if(skills.length) user.skills = skills
        user.role = role
        await user.save({validateBeforeSave: false})

        return res.status(200).json({message: "Update success"})
    } catch (error) {
        res.status(500).json({ error: "Update failed", message: error.message });
    }
}

export const getUsers = async (req, res) =>{
    try {
        if(req.user.role !== "admin") return res.status(403).json({error: "Unauthorized"})
        const allUsersList = User.find().select("-password")
    return res.json({allUsersList})
    } catch (error) {
         res.status(500).json({ error: "Fetching all users failed", message: error.message });
    }
}