const express = require("express");
const route = express.Router();
const { roleFetcher, roleInserter} = require("../controllers/role.controller");
const { userCourseFetcher, userFetch, userRegister, userActiviate, userLogin, userChangepassword, userForgotPassword, userForgotPasswordUpdate, userCourseAdder } = require("../controllers/user.controller");
const { courseSpecifFetcher, courseFetcher, courseInserter, lectureInserter } = require("../controllers/course.controller");
const verifyToken = require("../middlewares/jwt");

//roles
route.get("/roles", roleFetcher);
route.post("/roles", roleInserter);

//users
route.post("/users/register", userRegister);
route.get("/users/activiate/:token", userActiviate);
route.post("/users/login", userLogin);
route.patch("/users/forgot-password", userForgotPassword);
route.patch("/users/update-password", userForgotPasswordUpdate);
route.patch("/users/change-password", verifyToken, userChangepassword);
route.get("/users", userFetch);
route.put("/users/enroll-course/:id", userCourseAdder);
route.get("/users/find-courses/:id", verifyToken, userCourseFetcher);

//courses
route.get("/courses", courseFetcher);
route.get("/courses/:id", courseSpecifFetcher);
route.post("/courses", courseInserter);
route.put("/lecture-insert/:id", lectureInserter);


module.exports = route;