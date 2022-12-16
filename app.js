const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const nodemailer = require("nodemailer");
const session = require("express-session");
// const database = require("./database");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const admin = require("firebase-admin");
require("dotenv").config();


const serviceAccount = require("./assets-vaults-firebase-adminsdk-1dufk-87c82d4763.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://assets-vaults.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });



const app = express();

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
  );
  app.use(
    "/js",
    express.static(path.join(__dirname, "node_modules/jquery/dist"))
    );
    app.use("/assets", express.static(path.join(__dirname, "public/assets")));
    app.use("/css", express.static(path.join(__dirname, "public/css")));
    app.use("/js", express.static(path.join(__dirname, "public/js")));
    
  //   app.use((req,res,next)=>{
  //     res.setHeader('Access-Control-Allow-Origin','*');
  //     res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  //     res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
  //     next(); 
  // })

    app.use(
      session({
        secret: "webslesson",
        resave: true,
        saveUninitialized: true,
      })
      );

      app.all("*", (req, res, next) => {
        res.cookie("XSRF-TOKEN", req.csrfToken());
        next();
      });

// profile
      // app.get("/profile", function (req, res) {
      //   const sessionCookie = req.cookies.session || "";
      
      //   admin
      //     .auth()
      //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      //     .then((userData) => {
      //       console.log("Logged in:", userData.email)
      //       res.render("profile.html");
      //     })
      //     .catch((error) => {
      //       res.redirect("/sessionLogin");
      //     });
      // });
      
// user login
app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

// app.get("/sessionLogout", (req, res) => {
//   res.clearCookie("session");
//   res.redirect("/sessionLogin");
// });

app.get("/", (req, res) => {
  res.send("Welcome to Assets Vaults")
}); 
      
     app.get("/logout", (req, res) => {
        res.sendFile(path.join(__dirname, './views/logout.html'))
      });

app.get("/admin", (req, res) => {
  var email = req.body.email
  console.log("Logged in:",email)
  res.sendFile(path.join(__dirname, './views/index.html'))
});



// app.post('/login', (req, res) => {

//   const email = req.body.email;
//   const password = req.body.password;

//   // Use the Firebase Authentication API to sign in the user
//   firebase.auth().signInWithEmailAndPassword(email, password)
//     .then(user => {
//       // If the login is successful, store the user's ID in a session cookie
//       req.session.uid = user.uid;
//       res.redirect('/protected');
//     })
//     .catch(error => {
//       // If the login fails, display an error message
//       res.send(`
//         <p>Error: ${error.message}</p>
//         <a href="/login">Try again</a>
//       `);
//     });
// });





// contact mail
app.post("/mail", (req, res, next) => {
  const email = req.body.email;
  const message = `Name: ${req.body.name} \n\n Email: ${req.body.email} \n\n Message: ${req.body.message}`;

  var mail = {
    from: email,
    to: process.env.EMAIL,
    text: message,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "Sent Successfully!",
      });
    }
  });
});
//  mail service
app.post("/mail-service", (req, res, next) => {
  const email = req.body.email;
  const message = `Name: ${req.body.name} \n\n Email: ${req.body.email} \n\n Address: ${req.body.address}`;

  var mail = {
    from: email,
    to: process.env.EMAIL,
    text: message,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "Sent Successfully!",
      });
    }
  });
});

// app.post("/login", function (request, response, next) {
//   var username = request.body.username;

//   var user_password = request.body.password;

//   if (username && user_password) {
//     query = `
//       SELECT * FROM login 
//       WHERE username = "${username}" 
//       `;

//     database.query(query, function (error, data) {
//       if (data.length > 0) {
//         for (var count = 0; count < data.length; count++) {
//           if (data[count].user_password == user_password) {
//             request.session.user_id = data[count].user_id;

//             response.redirect("/admin");
//           } else {
//             response.send("Incorrect Password");
//           }
//         }
//       } else {
//         response.send("Username Not Registered!");
//       }
//       response.end();
//     });
//   } else {
//     response.send("Please Enter Username and Password Details");
//     response.end();
//   }
// });

// app.get("/logout", function (request, response, next) {
//   request.session.destroy();

//   response.redirect("/");
// });

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
