const dgram = require('dgram');
const ip = require('ip');
const UDP_PORT = 8888;

module.exports = {
  findActiveReceiver: (timeout, onFound, onNotFound) => {
  const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  let found = false;
  let interval = null;

  udp.on('message', (msg, rinfo) => {
    const data = msg.toString();

    if (data.startsWith('LOOKING_FOR_SENDER|') && !found) {
      found = true;

      console.log('[Receiver got]', data);

      const receiverIp = rinfo.address; // ✅ safer than parsing

      const confirmation = Buffer.from(`SENDER_READY|${ip.address()}`);

      // send repeatedly (reliability fix)
      interval = setInterval(() => {
        udp.send(confirmation, UDP_PORT + 1, rinfo.address);
      }, 500);

      // stop after 3 seconds
      setTimeout(() => {
        clearInterval(interval);
        udp.close();
      }, 3000);

      onFound(receiverIp);
    }
  });

  udp.bind(UDP_PORT, '0.0.0.0');

  setTimeout(() => {
    if (!found) {
      udp.close();
      onNotFound();
    }
  }, timeout);
},

  searchForSender: (onFound) => {
    const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    const myIp = ip.address();

    udp.bind(() => {
      udp.setBroadcast(true);
      setInterval(() => {
        const message = Buffer.from(`LOOKING_FOR_SENDER|${myIp}`);
        udp.send(message, UDP_PORT, '255.255.255.255');
      }, 1000);
    });

    const listener = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    listener.on('message', (msg) => {
      const data = msg.toString();
      if (data.startsWith('SENDER_READY|')) {
        const senderIp = data.split('|')[1];
        listener.close();
        udp.close();
        onFound(senderIp);
      }
    });
    
    // Bind the listener to 0.0.0.0 as well
    listener.bind(UDP_PORT + 1, '0.0.0.0');
  }
};