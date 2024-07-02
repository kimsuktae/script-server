import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createCsv = async ({ name, data } = request) => {
  const filePath = getFilePath(name);
  const header = getHeader(data);

  console.log(filePath);
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: header,
  });

  await csvWriter.writeRecords(data);

  return filePath;
};

const getHeader = (data) => {
  if (data.length === 0) {
    return [{ id: 'name', title: 'Data not exits' }];
  }

  return Object.keys(data[0]).map((key) => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1),
  }));
};

const getFilePath = (name) => {
  const dateTime = getDateTime();
  const rootDir = path.resolve(__dirname, '..');
  const csvDir = path.join(rootDir, 'csv');
  const dirPath = path.join(csvDir, name);
  const filePath = path.join(dirPath, getFileName(name, dateTime));

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return filePath;
};

const getDateTime = () => {
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  })
    .format(now)
    .replace(/\.\s/g, '-')
    .replace(/\s/g, '')
    .replace(/:/g, '-'); // YYYY-MM-DD_HH-MM-S

  return formattedDate.toString();
};

const getFileName = (name, dateTime) => {
  return `${name}_${dateTime}.csv`;
};

export default createCsv;
