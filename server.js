import http from 'http';
import { app } from './http-app.js';

const preferredPort = Number(process.env.PORT || 3000);
const maxPort = preferredPort + 25;

function startServer(port) {
  const server = http.createServer(app);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server: http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(`  UI:    http://localhost:${port}/`);
    // eslint-disable-next-line no-console
    console.log(`  API:   http://localhost:${port}/api?user=octocat&card=streak`);
    if (port !== preferredPort) {
      // eslint-disable-next-line no-console
      console.log(`(Port ${preferredPort} was in use; bound to ${port} instead.)`);
    }
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && port < maxPort) {
      server.close(() => startServer(port + 1));
      return;
    }
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

startServer(preferredPort);
