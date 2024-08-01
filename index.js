const express = require("express");
const app = express();
const port = 3000;
const path = require ('path');
const { fileURLToPath }  = require ('url');
const { dirname } = require ('path');
const sequelize = require("/home/strelizia/Library_Helper-Events/setup.js");
const sqlite = require ('sqlite')
const bodyParser = require("body-parser")
let data = `INSERT INTO dummy (firstName,LastName,email, txt) VALUES (?,?)`;

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/eventform',(req, res) => {
    res.sendFile(path.join( '/home/strelizia/Library_Helper-Events/Helpform.html'));
})
app.post('/eventform', (req, res) => {
  let db = new sqlite.Database("test.db");
  db.query(data)

  
  db.close();

  res.status(200);
  res.send("Submitted");

})



app.get('/admin',(req, res) => {
    res.sendFile(path.join(  'index.html'));
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
