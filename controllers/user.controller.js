const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { User, Role } = require("../models");

var transporter = nodemailer.createTransport({
host: "mail.privateemail.com",
port: 587,
secure: false,
  auth:{
      user: 'support@shlc.study',
      pass: 'shlc.study'
  }    
});

//#################################################################################################
//############################# User Account Registeration route ##################################
//#################################################################################################

const userRegister = (req, res) => {
  const roleCheck = req.body.role;

  Role.findOne({ role: roleCheck }, (err, role) => {
    if (role) {
      const roleId = role._id;
      //check user with username exist or not
      let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        role: roleId,
      });
      //if not exist user with such username we will check again with email
      User.getuserByEmail(newUser.email, (err, user) => {
        if (user) {
          return (400).json({
            meta: {
              success: false,
              message: "This email is already taken.",
            },
            self: req.originalUrl,
          });
        } else {
          //if not user with such data, we will send a mail to activiate and create account

          //implementing the jwt for mailserver
          const { username, email, phone, password, role, courses } = newUser;
          const token = jwt.sign(
            { username, email, phone, password, role, courses },
            process.env.JWT_ACC_ACTIVATION,
            { expiresIn: "30m" }
          );

          var mailOptions = {
            from: "support@shlc.study",
            to: email,
            subject: "SHLC account registration.",
            html: `
            <h2>Please activiate your account by clicking the link given below</h2>
            <a href="${process.env.CLIENT_URL}/api/users/activiate/${token}" style="background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            cursour: pointer;
            display: inline-block;
            font-size: 16px;">Click Here</a>
            `,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(500).json({
                meta: {
                  success: false,
                  message: error,
                },
                self: req.originalUrl,
              });
            } else {
              console.log("Email sent: " + info.response);
              return res.status(200).json({
                meta: {
                  success: true,
                  message: `Account verification mail is send to ${email}.`,
                },
                self: req.originalUrl,
              });
            }
          });
          //End of implementing the mailserver with jwt
        }
      });
    } else {
      return (400).json({
        meta: {
          success: false,
          message: "Requested Role is not avaliable.",
        },
        self: req.originalUrl,
      });
    }
  });
};

//#################################################################################################
//################################## User Account login ###########################################
//#################################################################################################
const userLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getuserByEmail(email, (err, user) => {
    if (err) {
      console.log("Error while getUserByEmail =" + err);
      return res.status(500).json({
        meta: {
          success: false,
          message: "Server error.[!email verify]",
        },
        self: req.originalUrl,
      });
    }
    if (!user) {
      return res.status(404).json({
        meta: {
          success: false,
          message: "There is not user with this email.",
        },
        self: req.originalUrl,
      });
    }
    User.comparePassword(password, user.password, (err, isMath) => {
      if (err) {
        console.log("Error while comparing password =" + err);
        return res.status(404).json({
          meta: {
            success: false,
            message: "Server error.[!password comparing]",
          },
          self: req.originalUrl,
        });
      }
      if (isMath) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_ACC_LOGIN, {
          expiresIn: "7d",
        });
        const { _id, username, phone, email, role } = user;
        return res.status(200).json({
          meta: {
            success: true,
            message: "login-success",
          },
          data: {
            token: token,
            user: {
              _id,
              username,
              email,
              phone,
              role: role.role,
            },
          },
        });
      } else {
        return res.status(403).json({
          meta: {
            success: false,
            message: "The password you enter is not match with your email.",
          },
          self: req.originalUrl,
        });
      }
    });
  });
};

//#################################################################################################
//################## User Account Activiation and Creation route ##################################
//#################################################################################################
const userActiviate = (req, res) => {
  const token = req.params.token;
  if (token) {
    jwt.verify(token, process.env.JWT_ACC_ACTIVATION, (err, decodedToken) => {
      if (err) {
        return res
          .status(400)
          .send("Your token is not match or may be expire.");
      } else {
        const { username, phone, email, password, role } = decodedToken;
        let newUser = new User({
          username,
          email,
          phone,
          password,
          role,
        });
        //Actually creating the user account
        User.addUser(newUser, (err, user) => {
          if (err) {
            let message = "";
            if (err.errors.email) {
              message += "Email already taken.";
            }
            return res.status(400).json({
              meta: {
                success: false,
                mesage: message,
              },
              self: req.originalUrl,
            });
          } else {
            res.status(200).json({
              meta: {
                success: true,
                message: `Account creation succeed.`,
              },
              data: user,
              self: req.originalUrl,
            });
          }
        });
      }
    });
  } else {
    res.send("Something Wrong.Please Try again.");
  }
};

//#################################################################################################
//################## User Account Forgot Password route ###########################################
//#################################################################################################
const userForgotPassword = (req, res) => {
  //Check user with such email is exist or not
  const email = req.body.email;
  User.getuserByEmail(email, (err, user) => {
    if (err) {
      console.log("Error while getUserByEmail =" + err);
      return res.status(404).json({
        meta: {
          success: false,
          message: "There is not user account with this email.",
        },
        self: req.originalUrl,
      });
    } else {
      const _id = user._id;
      //implementing the jwt for mailserver
      const token = jwt.sign({ _id }, process.env.JWT_ACC_FORGET_PW, {
        expiresIn: "30m",
      });
      var mailOptions = {
        from: "support@shlc.study",
        to: email,
        subject: "SHLC account registration.",
        html: `
    <h2>Please activiate your account by clicking the link given below</h2>
    <a href="${process.env.CLIENT_URL}/api/users/reset-password/${token}" style="background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    cursour: pointer;
    display: inline-block;
    font-size: 16px;">click Here</a>
    `,
      };
      //update the reset link
      User.setResetLink(_id, token, (err, success) => {
        if (err) {
          return res.status(500).json({
            meta: {
              success: false,
              message: err,
            },
            self: req.originalUrl,
          });
        } else {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(500).json({
                meta: {
                  success: false,
                  message: error,
                },
                self: req.originalUrl,
              });
            } else {
              console.log("Email sent: " + info.response);
              return res.status(200).json({
                meta: {
                  success: true,
                  message: `Email has been sent, kindly check your mail: ${email}.`,
                },
                self: req.originalUrl,
              });
            }
          });
        }
      });
      //End of implementing the mailserver with jwt
    }
  });
};

//#################################################################################################
//################## User Account Forgot Password Reseter Route ###################################
//#################################################################################################
const userForgotPasswordUpdate = (req, res) => {
  const resetLink = req.params.link;
  const newPassword = req.body.newPassword;
  if (resetLink) {
    jwt.verify(resetLink, process.env.JWT_ACC_FORGET_PW, (err, decodedData) => {
      if (err) {
        return res.status(403).json({
          meta: {
            success: false,
            errors: "Authentication error!!",
          },
          data: err,
          self: req.originalUrl,
        });
      } else {
        User.getUserByResetLink(resetLink, (err, user) => {
          if (err || !user) {
            return res.status(404).json({
              meta: {
                success: false,
                message: "Authentication failed.",
              },
              self: req.originalUrl,
            });
          } else {
            User.updatePassword(user._id, newPassword, (err, success) => {
              if (err) {
                return res.status(404).json({
                  meta: {
                    success: false,
                    message: "Failed while updating the new password.",
                  },
                  self: req.originalUrl,
                });
              } else {
                return res.status(200).json({
                  meta: {
                    success: true,
                    message: `Your password is changed successfully.`,
                  },
                  self: req.originalUrl,
                });
              }
            });
          }
        });
      }
    });
  } else {
    return res.status(401).json({
      meta: {
        success: false,
        errors: "Authentication error!!",
      },
      self: req.originalUrl,
    });
  }
};

//#################################################################################################
//################## User Account Change Account information Route ################################
//#################################################################################################
const userChangepassword = (req, res) => {
  const _id = req.body._id;
  const newPassword = req.body.newpassword;
  const password = req.body.password;

  if (newPassword !== "") {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) {
          return res.status(500).json({
            meta: {
              success: false,
              message: "Internal Server Error.[bcrypt]",
            },
            self: req.originalUrl,
          });
        } else {
          const hashpassword = hash;
          User.getUserById(_id, (err, user) => {
            if (err) {
              return res.status(400).json({
                meta: {
                  success: false,
                  message: "user not found.",
                },
                self: req.originalUrl,
              });
            } else {
              if (user) {
                User.comparePassword(password, user.password, (err, isMath) => {
                  if (err) {
                    return res.status(400).json({
                      meta: {
                        success: false,
                        message: err,
                      },
                    });
                  }
                  if (isMath) {
                    User.findByIdAndUpdate(
                      { _id },
                      {
                        password: hashpassword,
                      },
                      (err, user) => {
                        if (err) {
                          return res.status(500).json({
                            meta: {
                              success: false,
                              message:
                                "Internal Server Error.[User Update!]" + err,
                            },
                            self: req.originalUrl,
                          });
                        } else {
                          return res.status(200).json({
                            meta: {
                              success: true,
                              message: "Update Success",
                            },
                            self: req.originalUrl,
                          });
                        }
                      }
                    );
                  } else {
                    return res.status(403).json({
                      meta: {
                        success: false,
                        message: "The password is incorrect.",
                      },
                      self: req.originalUrl,
                    });
                  }
                });
              }
            }
          });
        }
      });
    });
  } else {
    return res.status(400).json({
      meta: {
        success: false,
        message: "There is no password.",
      },
      self: req.originalUrl,
    });
  }
};

const userFetch = (req, res) => {
  User.find((err, user) => {
    if (err) {
      return res.status(500).json({
        meta: {
          success: false,
          message: "Error occur while fetching user. " + err,
        },
        self: req.originalUrl,
      });
    } else {
      return res.status(200).json({
        meta: {
          success: true,
          message: "User Fetching success",
          lenght: user.length,
        },
        data: {
          user,
        },
        self: req.originalUrl,
      });
    }
  });
};

const userCourseAdder = (req, res) => {
  const _id = req.params.id;
  const courseId = req.body.courseId;
  try {
    User.findByIdAndUpdate(_id, {
      $push: {
        courses: courseId,
      },
    }, (err, user) => {
      if(err) {
        return res.status(400).json({
          meta: {
            success: true,
            message: "Error occur while inserting course to this user " + err,
          },
          self: req.originalUrl,
        })
      }
      else {
        return res.status(201).json({
          meta: {
            success: true,
            message: "Enroll success.",
          },
          data: user,
          self: req.originalUrl,
        })
      }
    });
  } catch (error) {
    return res.status(500).json({
      meta: {
        success: false,
        message: "Server error. " + error,
      },
      self: req.originalUrl,
    });
  }
};

const userCourseFetcher = ( req, res ) => {
  const _id = req.params.id;
  User.findById(_id).populate("courses").exec((err, user) => {
    if(err){
      return res.status(404).json({
        meta: {
          success: false,
          message: "Request fail" + err,
        },
        self: req.originalUrl,
      });
    }
    else {
      return res.status(200).json({
        meta: {
          success: true,
          message: "Fetch success.",
        },
        data: user.courses,
        self: req.originalUrl,
      })
    }
  })
}

module.exports = {
  userRegister,
  userActiviate,
  userForgotPassword,
  userForgotPasswordUpdate,
  userLogin,
  userChangepassword,
  userFetch,
  userCourseAdder,
  userCourseFetcher
};
