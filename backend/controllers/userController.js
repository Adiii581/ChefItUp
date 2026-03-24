import User from "../models/users.model.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
