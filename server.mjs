import express from 'express';
import bodyParser from 'body-parser';
import simple from './scripts/simple-script.mjs';
import download from './service/downloadCsvService.mjs';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// GET 요청에서 쿼리 매개변수 받기
app.get('/greet', async (req, res) => {
  const name = req.query.name || 'World';

  res.send(await simple(name));
});

app.get('/csvs', (req, res) => {
  const path = req.query.path;

  if (!path) {
    return res.status(400).send('fileName query parameter is required');
  }

  download(res, path);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
