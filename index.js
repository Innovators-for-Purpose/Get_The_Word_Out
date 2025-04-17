const express = require("express");
const app = express();
const sequelize = require("./setup.js");

const eventRoutes = require("./routes/eventRoutes.js");
const userRoutes = require("./routes/userRoutes.js")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/events/", eventRoutes);
app.use("/login", userRoutes);
app.use("/signup", userRoutes);


// app.get("/", (req, res) => {
//   res.render("login", {link_name: "/login"}, );
// });

app.get("/reset", (req, res) => {
  res.render("reset");
});

app.get("/signup-page", (req, res) => {
   res.render("signup");
});

app.get("/login-page", (req, res) => {
  res.render("login");
});
app.get("/create-an-event", (req, res) => {
  res.render("create-an-event");
})


app.get("/", (req, res) => {
  res.render("index", {link_name: "/events"}, );
});


// app.get("/ajax", (req, res) => {
//   console.log("Made it!")
// });

app.get("/Create", (req, res) => {
  res.render("event");
});

app.get("/edit", (req, res) => {
  res.render("event");
});

app.get("/autofill", (req, res) =>{
  res.render("autofill")
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
}); 

(async () => {
  try {
    await sequelize.sync();
  } catch (error) {
    console.error("Failed to synchronize models:", error);
  }
})();



app.get('*', (_, res) => {
  res.status(404).send("Error 404; page not found")
}); // Page not found error redirect



























/*
const express = require("express");
const app = express();
const port = 3000;
const path = require ('path');
const { fileURLToPath }  = require ('url');
const { dirname } = require ('path');
const sequelize = require('./setup')
const sqlite = require ('sqlite')
const sqlite3 = require ('sqlite3')
const bodyParser = require("body-parser")
multer = require("multer")
multer = require("multer")

app.use(express.static(path.join(__dirname, 'public')));

app.use(multer().array());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/eventform', (req, res) => {
  let db = new sqlite.Database("/home/strelizia/Library_Helper-Events/test.db");
  db.run(`INSERT INTO dummy (email, txt) VALUES (?,?)`, [
    req.body.email, req.body.txt
    ], function (err) {
      if (err) { console.log(err); }
      else { console.log(`INSERTED - ID ${this.lastID}`); }
    });

  
  db.close();

  res.status(200);
  res.send("Submitted");

})

app.get('/signin',(req, res) => {
    res.sendFile(path.join(  '/home/strelizia/Library_Helper-Events/index.html'));
})

app.post('/sigin',(req, res) => {

})

app.get('/create-event', (req, res) => {
  res.render("event.ejs")
})

app.listen(3142, () => {
  console.log("Server started on port 3142");
});

(async () => {
  try {
    await sequelize.sync();
  } catch (error) {
    console.error("Failed to synchronize models:", error);
  }
})();
*/