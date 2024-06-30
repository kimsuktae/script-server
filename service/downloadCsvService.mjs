import fs from 'fs';

const download = (res, filePath) => {
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file', err);
        res.status(500).send('Error downloading file');
      }
    });

    return;
  }

  res.status(404).send('File not found');
};

export default download;
