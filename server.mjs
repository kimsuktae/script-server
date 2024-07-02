import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import download from './service/downloadCsvService.mjs';
import runScript from './service/runScriptService.mjs';
import { checkOrigin, corsOptions } from './config/corsConfig.mjs';
import { configDotenv } from 'dotenv';

const app = express();
const port = 9999;
configDotenv();

const handler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.use(checkOrigin);
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post(
  '/datas',
  handler(async (req, res) => {
    const { scriptName, parameters } = req.body;

    if (!scriptName) {
      return res.status(400).send({ error: 'scriptName is required' });
    }

    const result = await runScript(scriptName, parameters);
    res.send(result);
  }),
);

app.get(
  '/csvs',
  handler((req, res) => {
    const path = req.query.path;

    if (!path) {
      return res.status(400).send('fileName query parameter is required');
    }

    download(res, path);
  }),
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

// 예기치 않은 예외 처리
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
