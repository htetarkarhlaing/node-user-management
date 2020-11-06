const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 587,
  secure: false,
  auth: {
    user: "support@shlc.study",
    pass: "shlc.study",
  },
});

const forgotHandlebar = fs.readFileSync(
  path.join(__dirname, "../views/forgotpassword.hbs"),
  "utf8"
);

const registerHandlebar = fs.readFileSync(
    path.join(__dirname, "../views/forgotpassword.hbs"),
    "utf8"
  );

const forgotTemplate = handlebars.compile(forgotHandlebar);
const registerTemplate = handlebars.compile(registerHandlebar);

const mailSender = (email, subjects, body, text, callback) => {
    var html;
    if(body.toString() === "register"){
        var html = registerTemplate({text});
    }
    else {
        var html = forgotTemplate({text});
    }
  const mailOption = {
    from: "support@shlc.study",
    to: email,
    subject: subjects,
    html
  };

  transporter.sendMail(mailOption, function (err, data) {
    if (err) {
        return callback(err, null);
    } else {
        return callback(null, data);
    }
  });
};

module.exports = mailSender;
