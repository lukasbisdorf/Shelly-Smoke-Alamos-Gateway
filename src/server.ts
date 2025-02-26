import { createApp } from './app';
import { initializePassport } from './passport';
import { setupRoutes } from './routes';

export class Server {
  private app = createApp();
  private port = process.env.PORT || 3000;

  constructor() {
    initializePassport(this.app);
    setupRoutes(this.app);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
