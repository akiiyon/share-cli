#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Import our custom modules
const discovery = require('../lib/discovery');
const transfer = require('../lib/transfer');
const mobile = require('../lib/mobile');

const program = new Command();

program
  .name('share-js')
  .description('Professional CLI tool to share files across local network')
  .version('1.0.0');

// --- SEND COMMAND (Debug Mode) ---
// program
//   .command('send <file>')
//   .description('DEBUG: Forcing TCP mode to test connection')
//   .action((file) => {
//     const filePath = path.resolve(file);

//     if (!fs.existsSync(filePath)) {
//       console.log(chalk.red(`\nError: File not found at ${filePath}`));
//       return;
//     }

//     console.log(chalk.red.bold(`\n[DEBUG MODE] Bypassing discovery...`));
//     console.log(chalk.cyan(`Preparing: ${path.basename(filePath)}`));
    
//     // Call the server directly without waiting for discovery
//     transfer.startServer(filePath);
//   });

// --- SEND COMMAND (Smart Logic) ---
program
  .command('send <file>')
  .description('Send a file to a receiver (P2P) or generate a web link if no receiver found')
  .action((file) => {
    const filePath = path.resolve(file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red(`\nError: File not found at ${filePath}`));
      return;
    }
    
    console.log(chalk.cyan(`\n[Smart-Send] Preparing: ${path.basename(filePath)}`));
    console.log(chalk.yellow('Searching for active receivers on the network (5s)...'));

    // Search for an active receiver first
    discovery.findActiveReceiver(5000, 
      (receiverIp) => {
        // IF FOUND: Start the PC-to-PC TCP Server
        console.log(chalk.green(`\nFound active receiver at ${receiverIp}!`));
        console.log(chalk.green('Starting high-speed P2P transfer...'));
        transfer.startServer(filePath);
      }, 
      () => {
        // IF NOT FOUND: Switch to Web/Mobile HTTP Mode
        console.log(chalk.magenta('\nNo active PC receiver found.'));
        console.log(chalk.magenta('Switching to Web/Mobile mode...'));
        mobile.startServer(filePath);
      }
    );
  });

// --- RECEIVE COMMAND ---
program
  .command('receive [ip]') // Added [ip] as an optional argument
  .description('Receive a file (Auto-discovery if no IP provided, otherwise manual)')
  .action((ipAddress) => {
    console.log(chalk.blue.bold('\n--- RECEIVE MODE ---'));

    if (ipAddress) {
      // MANUAL MODE: Connect directly to the provided IP
      console.log(chalk.yellow(`Manually connecting to sender at ${ipAddress}...`));
      transfer.receiveFile(ipAddress);
    } else {
      // AUTO MODE: Use UDP discovery
      console.log(chalk.cyan('Broadcasting presence... searching for sender.'));
      discovery.searchForSender((senderIp) => {
        console.log(chalk.green(`\nAuto-detected sender: ${senderIp}`));
        transfer.receiveFile(senderIp);
      });
    }
  });

program.parse(process.argv);