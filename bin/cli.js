#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Importing logic from your lib folder
const discovery = require('../lib/discovery');
const transfer = require('../lib/transfer');
const mobile = require('../lib/mobile');

const program = new Command();

program
  .name('share-js')
  .description('CLI to share files across same network')
  .version('1.0.0');

// Command: PC-to-PC Send
program
  .command('send')
  .argument('<file>', 'path to the file to share')
  .description('Share a file with another PC on the network')
  .action((file) => {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`Error: File not found at ${filePath}`));
      process.exit(1);
    }
    console.log(chalk.green(`\n[PC-to-PC] Preparing to send: ${path.basename(filePath)}`));
    transfer.startServer(filePath);
    discovery.broadcast();
    console.log(chalk.yellow('Broadcasting presence... waiting for a receiver.'));
  });

// Command: PC-to-PC Receive
// Change this section in bin/cli.js
program
  .command('receive')
  .argument('[ip]', 'Optional: Manually connect to a sender IP') // Added [ip] as optional
  .description('Search for and receive a file from another PC')
  .action((manualIp) => {
    if (manualIp) {
      console.log(chalk.green(`Manually connecting to sender at ${manualIp}...`));
      transfer.receiveFile(manualIp);
    } else {
      console.log(chalk.cyan('\nSearching for senders on the local network...'));
      discovery.listenForPeers((senderIp) => {
        console.log(chalk.green(`Found sender at ${senderIp}! Connecting...`));
        transfer.receiveFile(senderIp);
      });
    }
  });

// Command: Mobile Share (QR Code)
program
  .command('mobile')
  .argument('<file>', 'path to the file to share')
  .description('Share a file with a mobile device via QR code')
  .action((file) => {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`Error: File not found at ${filePath}`));
      process.exit(1);
    }
    // Note: Ensure your lib/mobile.js exports a function named 'startServer'
    mobile.startServer(filePath);
  });

program.parse(process.argv);