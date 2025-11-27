const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
const apiRoutes = require("./routes/api");
const passport = require("passport");
const cors = require("cors");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config();
const compression = require("compression");

const app = express();
const port = process.env.PORT;

// for security of connecting fronted to backend ip
app.use(cors());
app.use(compression());

//for converting all inputs to json
app.use(express.json());

// connecting mongodb cluster..
mongoose
  .connect(
    `mongodb+srv://smitgajera10:${process.env.MONGO_PASSWORD}@cluster0.nss23.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected with MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ _id: jwt_payload.identifier });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
  
app.use(passport.initialize());
app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);
app.use("/api" , apiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
