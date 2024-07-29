import express from 'express';
const app = express();
const port = 3000;
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const sequelize = require("./setup");
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/eventform',(req, res) => {
    res.sendFile(path.join( _dirname, 'index.html'));
})
app.post('/eventform', (req, res) => {

})

app.get('/helpform',(req, res) => {
    res.sendFile(path.join( _dirname, 'Helpfrom.html'));
})
app.post('/helpform', (req, res) => {

})

app.get('/admin',(req, res) => {
    res.sendFile(path.join( _dirname, 'index.html'));
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

(async () => {
  try {
    await sequelize.sync();
  } catch (error) {
    console.error("Failed to synchronize models:", error);
  }
})();