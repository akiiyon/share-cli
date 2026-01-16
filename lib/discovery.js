const dgram = require('dgram');
const ip = require('ip');
const UDP_PORT = 8888;

module.exports = {
  broadcast: () => {
    const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    
    udp.bind(() => {
      udp.setBroadcast(true); 
      console.log(`[Discovery] Broadcasting presence from ${ip.address()}...`);
      
      setInterval(() => {
        const message = Buffer.from(`SHARE_CLI|${ip.address()}`);
        // Sending to 255.255.255.255 targets every device on the local network
        udp.send(message, UDP_PORT, '255.255.255.255');
      }, 1000);
    });
  },
  
  listenForPeers: (onFound) => {
    const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    
    udp.on('message', (msg) => {
      const data = msg.toString();
      if (data.startsWith('SHARE_CLI|')) {
        const senderIp = data.split('|')[1];
        onFound(senderIp);
        udp.close();
      }
    });

    udp.bind(UDP_PORT, '0.0.0.0'); // Listen on all available network interfaces
  }
};