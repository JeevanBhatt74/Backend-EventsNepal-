import { Router } from "express";
import { authenticateJWT, authorizeRole } from "../middleware/auth";
import { register, login, updateUserInfo } from "../controllers/auth";

const router = Router();

router.post("/register", register);
// @ts-ignore
router.post("/login", login);

// @ts-ignore
router.put("/users/:id", authenticateJWT, updateUserInfo);

// Protected user route example
// @ts-ignore
router.get("/user-profile", authenticateJWT, (req, res) => {
  // @ts-ignore
  res.json({ message: "User profile", user: req.user });
});

// Protected admin route example
router.get(
  "/admin-dashboard",
  // @ts-ignore
  authenticateJWT,
  authorizeRole(["admin"]),
  (req, res) => {
    // @ts-ignore
    res.json({ message: "Admin dashboard", user: req.user });
  }
);

export default router;
