const net = require('net');
const fs = require('fs');
const path = require('path');
const cliProgress = require('cli-progress');
const chalk = require('chalk');

const TCP_PORT = 8889;

module.exports = {
  startServer: (filePath) => {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const fileSize = stats.size;

    const server = net.createServer((socket) => {
      console.log(chalk.green(`[Server] Connection from: ${socket.remoteAddress}`));
      
      // FIX 1: Send Header in the format the receiver expects: "name|size\n"
      socket.write(`${fileName}|${fileSize}\n`); 
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(socket);
      socket.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        console.log(chalk.cyan('[Server] Client disconnected (Transfer finished).'));
      } else {
        console.error(chalk.red('[Socket Error]:'), err.message);
      }
    });
    });

    server.listen(TCP_PORT, '0.0.0.0', () => {
      console.log(chalk.green.bold('\n>>> SERVER IS ACTIVELY LISTENING ON PORT 8889 <<<'));
      console.log(chalk.white(`Sharing: ${fileName} (${fileSize} bytes)`));
    });
  },

  receiveFile: (host) => {
    const client = new net.Socket();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let receivedBytes = 0;
    let metaReceived = false;
    let fileStream;
    let buffer = Buffer.alloc(0); // Buffer to handle partial header reads

    console.log(chalk.yellow(`[Client] Attempting connection to ${host}:${TCP_PORT}...`));

    client.connect(TCP_PORT, host, () => {
      console.log(chalk.green('[Client] Connected! Waiting for file data...'));
    });

    client.on('data', (chunk) => {
      if (!metaReceived) {
        // Accumulate data until we find the newline character
        buffer = Buffer.concat([buffer, chunk]);
        const newlineIndex = buffer.indexOf('\n');
        
        if (newlineIndex !== -1) {
          const header = buffer.slice(0, newlineIndex).toString();
          const [name, size] = header.split('|');
          
          if (!name || !size) {
            console.error(chalk.red('[Error] Invalid file header received.'));
            client.destroy();
            return;
          }

          console.log(chalk.blue(`[Client] Receiving: ${name} (${size} bytes)`));
          
          fileStream = fs.createWriteStream(path.join(process.cwd(), name));
          progressBar.start(parseInt(size), 0);
          
          metaReceived = true;

          // Write the remaining data from the buffer after the newline
          const remaining = buffer.slice(newlineIndex + 1);
          if (remaining.length > 0) {
            fileStream.write(remaining);
            receivedBytes += remaining.length;
            progressBar.update(receivedBytes);
          }
          buffer = null; // Clear buffer to save memory
        }
      } else {
        if (fileStream) {
          fileStream.write(chunk);
          receivedBytes += chunk.length;
          progressBar.update(receivedBytes);
        }
      }
    });

    client.on('end', () => {
  progressBar.stop();
  console.log(chalk.green.bold('\n[Success] File saved to current directory.'));
  // Give it a tiny delay to ensure the OS handles the socket closure
  setTimeout(() => {
    process.exit(0);
  }, 100);
});

    client.on('error', (err) => {
      console.error(chalk.red('\n[Client Error]:'), err.message);
      process.exit(1);
    });
  }
};