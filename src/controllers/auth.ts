import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";

const userModel = new UserModel();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.createUser(email, hashedPassword, name);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    // @ts-ignore
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "some secret key",
      { expiresIn: "1h" }
    );

    // @ts-ignore
    delete user["password"];

    res.json({
      token,
      user,
    });
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ error: error.message });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get user ID from URL params
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await userModel.findById(Number(id));
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hash new password if provided
    }

    const updatedUser = await userModel.updateUser(
      Number(id),
      name,
      email,
      hashedPassword,
      role
    );

    delete (updatedUser as any).password; // Remove password from response

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
