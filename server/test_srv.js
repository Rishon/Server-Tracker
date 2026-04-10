const dns = require('dns');
dns.resolveSrv('_minecraft._tcp.play.topstrix.net', (err, records) => {
  console.log('TopStrix:', err, records);
});
dns.resolveSrv('_minecraft._tcp.play.israelmc.net', (err, records) => {
  console.log('IsraelMC:', err, records);
});
