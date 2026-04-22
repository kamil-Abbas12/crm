import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export const signToken = (user: any) => {
  return jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};