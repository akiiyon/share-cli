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
    
    const server = net.createServer((socket) => {
      // Handle sudden disconnects gracefully
      socket.on('error', (err) => {
        if (err.code !== 'ECONNRESET') {
          console.error(chalk.red('\n[Server Socket Error]:'), err.message);
        }
      });

      console.log(chalk.green(`\n[Server] Client connected! Sending: ${fileName}`));
      
      // Send Metadata (Name|Size\n)
      socket.write(`${fileName}|${stats.size}\n`);

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(socket);

    socket.on('end', () => {
    console.log(chalk.cyan('\n[Server] Transfer complete. Shutting down...'));
    
    // This destroys the connection
    socket.destroy(); 
    
    // This kills the entire Sender script so the terminal returns to the command prompt
    process.exit(0); 
    });
    });

    // CRITICAL: This line opens the port!
    server.listen(TCP_PORT, '0.0.0.0', () => {
      console.log(chalk.green.bold(`\n>>> SERVER IS LIVE ON PORT ${TCP_PORT} <<<`));
      console.log(chalk.yellow(`Waiting for receiver to connect...`));
    });

    server.on('error', (err) => {
      console.error(chalk.red('[Server Error]:'), err.message);
    });
  },

  receiveFile: (host) => {
    const client = new net.Socket();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let receivedBytes = 0;
    let metaReceived = false;
    let fileStream;

    console.log(chalk.yellow(`[Client] Attempting connection to ${host}:${TCP_PORT}...`));

    client.connect(TCP_PORT, host, () => {
      console.log(chalk.green('[Client] Connected! Starting download...'));
    });

    client.on('data', (chunk) => {
      if (!metaReceived) {
        const data = chunk.toString();
        const newlineIndex = data.indexOf('\n');
        
        if (newlineIndex !== -1) {
          const [name, size] = data.slice(0, newlineIndex).split('|');
          console.log(chalk.blue(`[Client] Filename: ${name} (${size} bytes)`));
          
          fileStream = fs.createWriteStream(name);
          progressBar.start(parseInt(size), 0);
          
          metaReceived = true;
          const remaining = chunk.slice(newlineIndex + 1);
          if (remaining.length > 0) {
            fileStream.write(remaining);
            receivedBytes += remaining.length;
            progressBar.update(receivedBytes);
          }
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
      console.log(chalk.green('\n[Client] File saved to current directory.'));
      process.exit(0);
    });

    client.on('error', (err) => {
      console.error(chalk.red('\n[Client Error]:'), err.message);
      process.exit(1);
    });
  }
};