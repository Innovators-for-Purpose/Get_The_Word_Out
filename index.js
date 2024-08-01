const express = require("express");
const app = express();
const port = 3000;
const path = require ('path');
const { fileURLToPath }  = require ('url');
const { dirname } = require ('path');
const sequelize = require("/home/strelizia/Library_Helper-Events/setup.js");
const sqlite = require ('sqlite')
const bodyParser = require("body-parser")
multer = require("multer")

app.use(multer().array());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/eventform',(req, res) => {
    res.sendFile(path.join( '/home/strelizia/Library_Helper-Events/Helpform.html'));
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

app.listen(3141, () => {
  console.log("Server started on port 3142");
});

(async () => {
  try {
    await sequelize.sync();
  } catch (error) {
    console.error("Failed to synchronize models:", error);
  }
})();
