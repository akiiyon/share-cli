const express = require('express');
const qrcode = require('qrcode-terminal');
const ip = require('ip');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const localIP = require('./getLocalIP')

const HTTP_PORT = 8080;

module.exports = {
  startServer: (filePath) => {
    const app = express();
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);

    const localIp = localIP.getLocalIP();
    const baseUrl = `http://${localIp}:${HTTP_PORT}`;

    let server; // for closing later

    // 🟢 LANDING PAGE (IMPORTANT FIX)
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>ShareCLI</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px;">
            <h2>📁 File Ready to Download</h2>
            <p><strong>${fileName}</strong></p>
            <p>Size: ${stats.size} bytes</p>

            <a href="/download"
              style="padding: 12px 20px; background: black; color: white; text-decoration: none; border-radius: 6px;">
              Download File
            </a>
          </body>
        </html>
      `);
    });

    // 🔵 DOWNLOAD ROUTE
    app.get('/download', (req, res) => {
      console.log(chalk.green(`\n[Mobile] Device connected! Sending: ${fileName} (${stats.size} bytes)`));

      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      const readStream = fs.createReadStream(filePath);

      readStream.on('error', (err) => {
        console.error(chalk.red('[Stream Error]:'), err.message);
        res.status(500).send('Error downloading file');
      });

      readStream.pipe(res);

      readStream.on('end', () => {
        console.log(chalk.cyan('[Mobile] Transfer finished successfully.'));

        // 🔥 OPTIONAL: auto shutdown after 1 download
        setTimeout(() => {
          console.log(chalk.yellow('[Mobile] Server shutting down...'));
          server.close();
        }, 2000);
      });
    });

    // 🚀 START SERVER
    server = app.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(chalk.blue.bold('\n--- MOBILE SHARE MODE ---'));
      console.log(chalk.white(`File: ${fileName}`));
      console.log(chalk.yellow(`Ensure your phone is on the SAME Wi-Fi: ${chalk.bold(localIp)}`));
      console.log(chalk.cyan(`\nScan this QR code:\n`));

      // QR now points to landing page (NOT /download)
      qrcode.generate(baseUrl, { small: true });

      console.log(chalk.dim(`\nWaiting for connection... (Press Ctrl+C to stop)`));
    });
  }
};