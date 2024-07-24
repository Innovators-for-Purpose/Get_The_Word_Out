import express from 'express';
const app = express();
const port = 3000;
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/form',(req, res) => {
    res.sendFile(path.join( _dirname, 'index.html'));
})
app.post('/form', (req, res) => {

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})