const router = require("express").Router();
const { signAccessToken, signRefreshToken } = require("../../utils/jwt");
const { conn } = require("../../config/db");

const mockupDatabase = {
  username: "nathapon",
  password: "1234",
};

router.post("/", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (!username && !password) {
    return res.status(400).json("Bad request!");
  }

  if (username !== mockupDatabase.username) {
    return res.status(401).json("Invalid Username!");
  }
  if (password !== mockupDatabase.password) {
    return res.status(401).json("Invalid Password!");
  }

  try {
    const token = await signAccessToken(username);
    const refreshToken = signRefreshToken(username);

    //* store refresh token in DB
    await conn(`INSERT INTO jwt(token) VALUES ('${refreshToken}')`);

    //* set refresh token in client Cookie
    res.cookie("refreshToken", refreshToken, {
      maxAge: 60000, // 1 minute
      httpOnly: false, // in prodution set to true
    });

    //* response access-token to client
    res.status(200).json({
      accessToken: token,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
