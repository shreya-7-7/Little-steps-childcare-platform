import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  const secret =
    process.env.JWT_SECRET || "little_steps_jwt_secret_dev_key_2026_super_secure";

  return jwt.sign(
    {
      id: userId,
      role,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
};

export default generateToken;
