export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface JwtPayload {
  userId: number;
  role: "user" | "admin";
  iat: number;
  exp: number;
}
