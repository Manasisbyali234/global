const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const backendTarget = process.env.REACT_APP_DEV_PROXY_TARGET || 'http://localhost:5000';

module.exports = function setupProxy(app) {
  app.use('/assets/css/rich-text-editor-fix.css', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    const filePath = path.resolve(__dirname, '../public/assets/css/rich-text-editor-fix.css');

    fs.access(filePath, fs.constants.R_OK, (error) => {
      if (error) {
        next();
        return;
      }

      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');

      if (req.method === 'HEAD') {
        res.status(200).end();
        return;
      }

      res.sendFile(filePath);
    });
  });

  app.use(
    ['/api', '/uploads', '/socket.io'],
    createProxyMiddleware({
      target: backendTarget,
      changeOrigin: true,
      ws: true,
      logLevel: 'warn'
    })
  );
};
