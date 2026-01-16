const express = require('express');
const qrcode = require('qrcode-terminal');
const ip = require('ip');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

const HTTP_PORT = 8080;

module.exports = {
  startServer: (filePath) => {
    const app = express();
    const fileName = path.basename(filePath);
    const localIp = ip.address();
    const downloadUrl = `http://${localIp}:${HTTP_PORT}/download`;

    // The route your phone will hit
    app.get('/download', (req, res) => {
      const stats = fs.statSync(filePath);
      
      console.log(chalk.green(`\n[Mobile] Device connected! Sending: ${fileName} (${stats.size} bytes)`));

      // Set headers so the phone knows it's a file download
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      const readStream = fs.createReadStream(filePath);
      
      // Handle errors during the stream
      readStream.on('error', (err) => {
        console.error(chalk.red('[Stream Error]:'), err.message);
        res.status(500).send('Error downloading file');
      });

      readStream.pipe(res);
      
      readStream.on('end', () => {
        console.log(chalk.cyan('[Mobile] Transfer finished successfully.'));
      });
    });

    app.listen(HTTP_PORT, '0.0.0.0',() => {
      console.log(chalk.blue.bold('\n--- MOBILE SHARE MODE ---'));
      console.log(chalk.white(`File: ${fileName}`));
      console.log(chalk.yellow(`Ensure your phone is on the SAME Wi-Fi: ${chalk.bold(localIp)}`));
      console.log(chalk.cyan(`\nScan this QR code to download:\n`));

      // This renders the QR code in your terminal
      qrcode.generate(downloadUrl, { small: true });

      console.log(chalk.dim(`\nWaiting for connection... (Press Ctrl+C to stop)`));
    });
  }
};