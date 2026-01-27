const dgram = require('dgram');
const ip = require('ip');
const UDP_PORT = 8888;

module.exports = {
  findActiveReceiver: (timeout, onFound, onNotFound) => {
    // Use { type: 'udp4', reuseAddr: true } to ensure Windows doesn't block the port
    const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    let found = false;

    udp.on('message', (msg, rinfo) => {
      const data = msg.toString();
      if (data.startsWith('LOOKING_FOR_SENDER|')) {
        found = true;
        const receiverIp = data.split('|')[1];
        
        const confirmation = Buffer.from(`SENDER_READY|${ip.address()}`);
        // Send confirmation back to the specific IP and Port that contacted us
        udp.send(confirmation, UDP_PORT + 1, rinfo.address);
        
        udp.close();
        onFound(receiverIp);
      }
    });

    // Bind to 0.0.0.0 to listen to ALL incoming network traffic on this port
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