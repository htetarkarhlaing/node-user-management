const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;
//creating the user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetLink: {
      data: String,
      default: "",
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role"
    }
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(uniqueValidator); //plug-in for unique

const User = (module.exports = mongoose.model("User", userSchema, "users")); // assign as name User and exports as Model.

module.exports.schema = userSchema; // exporting as user schema

//#####################  Custom Model Controllers #############################
//to find the user by id
module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
};

//to find the user by username
module.exports.getuserByUsername = (name, callback) => {
  const query = {
    name: name,
  };
  User.findOne(query, callback);
};

//to find user by email
module.exports.getuserByEmail = (email, callback) => {
  const query = {
    email: email,
  };
  User.findOne(query).populate("role", "-__v").exec(callback);
};

//to add user via pre-implemented encryption
module.exports.addUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        return err;
      } else {
        newUser.password = hash;
        newUser.save(callback);
      }
    });
  });
};

//to modified the user password when request forget password
module.exports.updatePassword = (_id, newPassword, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(newPassword, salt, (err, hash) => {
      if (err) return err;
      else {
        User.findByIdAndUpdate(
          _id,
          {
            password: hash,
          },
          callback
        );
      }
    });
  });
};

//to check user login information ( password ) is match or not
module.exports.comparePassword = (password, hash, calllback) => {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) {
      calllback(err, null)
    }
    calllback(null, isMatch);
  });
};

//to update the user resetlink for resetting the password
module.exports.setResetLink = (_id, link, callback) => {
  User.findByIdAndUpdate(_id, { resetLink: link }, callback);
};

//to get the user by resetlink
module.exports.getUserByResetLink = (resetLink, callback) => {
  User.findOne({resetLink: resetLink}, callback);
};