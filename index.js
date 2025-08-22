require('dotenv').config();
const express = require("express");
const app = express();
const sequelize = require("./setup.js");
const path = require("path");

const eventRoutes = require("./routes/eventRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

app.use(express.json({ limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.set("views", "./views");
app.set("view engine", "ejs");

// Mount your routers
app.use("/events", eventRoutes);
app.use("/login", userRoutes);
app.use("/signup", userRoutes);


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
});

app.get("/", (req, res) => {
  res.render("index", {link_name: "/events"}); // Ensure {link_name: "/events"} is correct
});


app.get("/Create", (req, res) => {
  res.render("event"); // Renders 'event.ejs'
});
app.get("/Edit",(req, res) => {
  res.render("event"); // Renders 'event.ejs'
});

app.get("/edit", (req, res) => {
  res.render("event");
});

app.get("/autofill", (req, res) =>{
  res.render("autofill");
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});

(async () => {
  try {
    await sequelize.sync();
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Failed to synchronize models:", error);
  }
})();

app.get('*', (_, res) => {
  res.status(404).send("Error 404; page not found");
});