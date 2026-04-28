# ShareCLI - Local Network File Sharing Tool 🚀

A fast, zero-friction CLI tool to share files across devices on the same network using UDP discovery and TCP transfer, with a browser-based fallback for universal access.

---

## Features ✨

- High-speed P2P file transfer over TCP
- Automatic device discovery using UDP broadcast
- Browser-based fallback with no installation required on the receiving device
- QR code support for mobile devices
- Smart mode that switches between P2P and web sharing
- Real-time progress tracking
- Runs entirely on the local network, with no external servers

---

## How It Works

```text
Sender
  |
  v
UDP broadcast finds receivers
  |
  v
Receiver found?
  |-- Yes: TCP transfer
  |-- No: HTTP server + QR code fallback
```

---

## Installation

### Run Instantly

```bash
npx share-js send file.txt
```

### Install Globally

```bash
npm install -g share-js
```

### Clone Locally

```bash
git clone https://github.com/akiiyon/share-cli.git
cd share-cli
npm install
npm link
```

---

## Usage

### Send a File

```bash
share-js send <file>
```

### Receive a File

```bash
share-js receive
```

### Receive Manually

Use this if automatic discovery fails.

```bash
share-js receive <sender-ip>
```

---

## Web and Mobile Mode

If no receiver is found, ShareCLI automatically switches to web mode.

```bash
share-js send file.txt
```

Then scan the QR code or open the printed link in a browser:

```text
http://192.168.x.x:8080
```

Click **Download File** to download the shared file.

### Example Browser Page

```text
File Ready to Download
testFile.txt

[ Download File ]
```

---

## Tech Stack

- Node.js
- TCP sockets (`net`)
- UDP discovery (`dgram`)
- Express for the HTTP fallback
- Streams for efficient file transfer
- Commander for the CLI framework


## Key Concepts

- UDP broadcast for service discovery
- TCP streaming for reliable transfer
- Buffer handling for partial packet reads
- Multi-protocol fallback design
- CLI architecture using Node.js

---

## Real-World Use Case

ShareCLI was built to solve a practical problem: sharing files through shared folders can be slow, messy, and error-prone.

With ShareCLI, you can:

- Transfer files directly between devices
- Avoid shared folder clutter
- Share files across laptops, phones, and browsers

---

---

## Future Improvements

- Authentication and secure tokens
- Multi-file transfer
- Resume interrupted transfers
- Multi-device selection
- Full browser-based receiving

---

## Author

Akshay Dhiman

---

<<<<<<< HEAD
## License

ISC
=======
MIT License
>>>>>>> 1f3f73bece71253b1b69b48d5aedf5cbfe234754
