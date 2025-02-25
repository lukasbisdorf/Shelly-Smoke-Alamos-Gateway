import express from 'express';
import path from 'path';
import { ConfigManager } from './services/ConfigManager';
import { AlarmTransformer } from './services/AlarmTransformer';
import { AlarmForwarder } from './services/AlarmForwarder';
import { ShellySmokeEvent, ShellyBatteryEvent } from './types/ShellyTypes';

export class Server {
  private app = express();
  private configManager = new ConfigManager();
  private alarmTransformer = new AlarmTransformer();
  private port = process.env.PORT || 3000;

  constructor() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.setupRoutes();
  }

  private setupRoutes() {
    // Root route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Alarm endpoint
    this.app.post('/api/alarm', async (req, res) => {
      const event: ShellySmokeEvent = req.body;
      
      if (event.event !== 'alarm') {
        return res.sendStatus(200);
      }

      const device = await this.configManager.getDevice(event.component);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const fe2Config = await this.configManager.getFE2Config();
      const forwarder = new AlarmForwarder(fe2Config);
      
      const alarm = this.alarmTransformer.transformToFE2Alarm(
        event, device, fe2Config.sender, fe2Config.authorization
      );

      const success = await forwarder.sendAlarm(alarm);
      res.sendStatus(success ? 200 : 500);
    });

    // Battery alarm endpoint
    this.app.post('/api/battery', async (req, res) => {
      const event: ShellyBatteryEvent = req.body;
      
      if (event.event !== 'low_battery') {
        return res.sendStatus(200);
      }

      const device = await this.configManager.getDevice(event.component);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const fe2Config = await this.configManager.getFE2Config();
      const forwarder = new AlarmForwarder(fe2Config);
      
      const alarm = this.alarmTransformer.transformBatteryAlarm(
        event, device, fe2Config.sender, fe2Config.authorization
      );

      const success = await forwarder.sendAlarm(alarm);
      res.sendStatus(success ? 200 : 500);
    });

    // Add these new endpoints before the closing setupRoutes() bracket
    this.app.post('/api/devices/:id/test/smoke', async (req, res) => {
      const device = await this.configManager.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const fe2Config = await this.configManager.getFE2Config();
      const forwarder = new AlarmForwarder(fe2Config);
      
      const testEvent: ShellySmokeEvent = {
        component: device.id,
        id: 0,
        event: 'alarm',
        ts: Math.floor(Date.now() / 1000),
        smoke: true,
        temperature: 25
      };

      const alarm = this.alarmTransformer.transformToFE2Alarm(
        testEvent, device, fe2Config.sender, fe2Config.authorization
      );

      const success = await forwarder.sendAlarm(alarm);
      res.sendStatus(success ? 200 : 500);
    });

    this.app.post('/api/devices/:id/test/battery', async (req, res) => {
      const device = await this.configManager.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const fe2Config = await this.configManager.getFE2Config();
      const forwarder = new AlarmForwarder(fe2Config);
      
      const testEvent: ShellyBatteryEvent = {
        component: device.id,
        id: 0,
        event: 'low_battery',
        ts: Math.floor(Date.now() / 1000),
        batteryLevel: 10
      };

      const alarm = this.alarmTransformer.transformBatteryAlarm(
        testEvent, device, fe2Config.sender, fe2Config.authorization
      );

      const success = await forwarder.sendAlarm(alarm);
      res.sendStatus(success ? 200 : 500);
    });

    // Configuration endpoints
    this.app.get('/api/config/devices', async (req, res) => {
      const devices = await this.configManager.getDevices();
      res.json(devices);
    });

    this.app.post('/api/config/devices', async (req, res) => {
      await this.configManager.addDevice(req.body);
      res.sendStatus(201);
    });

    this.app.delete('/api/config/devices/:id', async (req, res) => {
      await this.configManager.removeDevice(req.params.id);
      res.sendStatus(200);
    });

    this.app.put('/api/config/devices/:id', async (req, res) => {
      try {
        await this.configManager.updateDevice(req.body);
        res.sendStatus(200);
      } catch (error) {
        res.status(404).json({ error: 'Device not found' });
      }
    });

    this.app.get('/api/config/fe2', async (req, res) => {
      const config = await this.configManager.getFE2Config();
      res.json(config);
    });

    this.app.post('/api/config/fe2', async (req, res) => {
      await this.configManager.setFE2Config(req.body);
      res.sendStatus(200);
    });
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
