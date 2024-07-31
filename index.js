const express = require("express");
const app = express();
const port = 3142;
const path = require ('path');
const { fileURLToPath }  = require ('url');
const { dirname } = require ('path');
const sequelize = require("sequelize");


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/eventform',(req, res) => {
    res.sendFile(path.join( _dirname, 'index.html'));
})
app.post('/eventform', (req, res) => {

})

app.get('/helpform',(req, res) => {
    res.sendFile(path.join( '/home/strelizia/Library_Helper-Events/Helpform.html'));
})
app.post('/helpform', (req, res) => {

})

app.get('/admin',(req, res) => {
    res.sendFile(path.join(  'index.html'));
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
