# 🚀 ShareCLI — Local Network File Sharing Tool

A fast, zero-friction CLI tool to share files across devices on the same network using **UDP discovery + TCP transfer**, with a **browser-based fallback for universal access**.

---

## ✨ Features

- ⚡ High-speed **P2P file transfer (TCP)**
- 🔍 Automatic **device discovery (UDP broadcast)**
- 🌐 **Browser-based fallback** (no installation required)
- 📱 **QR code support** for mobile devices
- 🧠 Smart mode: auto-switches between P2P and web sharing
- 📊 Real-time progress tracking
- 🔒 Runs entirely on local network (no external servers)

---

## 🧠 How It Works


Sender
↓
UDP Broadcast (find receivers)
↓
If receiver found → TCP transfer (fast)
Else → HTTP server + QR (fallback)


---

## 📦 Installation

### ▶️ Run instantly (no install)
```bash
npx share-js send file.txt
📥 Install globally
npm install -g share-js
🛠️ Clone locally
git clone https://github.com/your-username/share-cli.git
cd share-cli
npm install
npm link
🚀 Usage
📤 Send a file
share-js send <file>
📥 Receive a file (auto-discovery)
share-js receive
📥 Manual receive (if discovery fails)
share-js receive <sender-ip>
🌐 Web / Mobile Mode (No Setup Required)

If no receiver is found, ShareCLI automatically switches to web mode.

Flow:
Run:
share-js send file.txt
Scan QR code OR open link:
http://192.168.x.x:8080
Click Download File
📱 Example
📁 File Ready to Download
testFile.txt
[ Download File ]
🛠️ Tech Stack
Node.js
TCP sockets (net)
UDP discovery (dgram)
Express (HTTP fallback)
Streams (efficient file transfer)
Commander (CLI framework)
⚙️ Key Concepts
UDP Broadcast for service discovery
TCP streaming for reliable transfer
Buffer handling for partial packet reads
Multi-protocol fallback design
CLI architecture using Node.js
💡 Real-World Use Case

Built to solve a practical problem:

Sharing files via shared folders is slow, messy, and error-prone.

Solution:
Direct file transfer between devices
No shared folder clutter
Works across laptops, phones, and browsers
⚠️ Limitations
Works only on the same local network
UDP discovery may be blocked on some corporate networks
P2P mode requires CLI on both devices
🚀 Future Improvements
🔐 Authentication / secure tokens
📦 Multi-file transfer
🔄 Resume interrupted transfers
👥 Multi-device selection
🌐 Full browser-based receiving
🧪 Demo

👉 Add a short GIF or video here (recommended)

👨‍💻 Author

Akshay Dhiman

📄 License

MIT License