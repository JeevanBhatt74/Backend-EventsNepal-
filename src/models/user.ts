import { User } from "../types";
import { pool } from "./pool";
import bcrypt from "bcrypt";

export class UserModel {
  constructor() {
    this.ensureAdminUser(); // Ensure the default admin user exists
  }

  async ensureAdminUser() {
    try {
      const hashedPassword = await bcrypt.hash("admin@123", 10);

      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        ["jeevan@gmail.com"]
      );

      if (existingUser.rows.length === 0) {
        console.log("Creating default admin user...");

        await pool.query(
          "INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)",
          ["jeevan@gmail.com", hashedPassword, "admin", "Jeevan"]
        );

        console.log("Default admin user created!");
      } else {
        console.log("Admin user already exists.");
      }
    } catch (error) {
      console.error("Error ensuring default admin user:", error);
    }
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    role: "user" | "admin" = "user"
  ): Promise<User> {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      throw new Error("User already exists");
    }

    const result = await pool.query(
      "INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, password, role, name]
    );
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async updateUser(
    id: number,
    name?: string,
    email?: string,
    password?: string,
    role?: "user" | "admin"
  ): Promise<User | null> {
    try {
      // Get the current user data
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Update only the fields that were provided
      const updatedName = name || existingUser.name;
      const updatedEmail = email || existingUser.email;
      const updatedPassword = password || existingUser.password;
      const updatedRole = role || existingUser.role;

      // Execute the update query
      const result = await pool.query(
        `UPDATE users 
         SET name = $1, email = $2, password = $3, role = $4 
         WHERE id = $5 RETURNING *`,
        [updatedName, updatedEmail, updatedPassword, updatedRole, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}
