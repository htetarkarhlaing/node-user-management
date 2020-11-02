const express = require("express");
const route = express.Router();
const { roleFetcher, roleInserter} = require("../controllers/role.controller");
const { userRegister, userActiviate, userLogin, userChangepassword, userForgotPassword, userForgotPasswordUpdate } = require("../controllers/user.controller");
const verifyToken = require("../middlewares/jwt");

//roles
route.get("/roles", roleFetcher);
route.post("/roles", roleInserter);

//users
route.post("/users/register", userRegister);
route.post("users/activiate/:token", userActiviate);
route.post("/users/login", userLogin);
route.patch("/users/forgot-password", userForgotPassword);
route.patch("/users/update-password", userForgotPasswordUpdate);
route.patch("/users/change-password", verifyToken, userChangepassword);


module.exports = route;