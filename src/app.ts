import express from 'express';
import path from 'path';

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));
  return app;
};
