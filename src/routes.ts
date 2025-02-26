import express from 'express';
import path from 'path';
import passport from 'passport';
import { AlarmService } from './services/AlarmService';
import { BatteryService } from './services/BatteryService';
import { AuthService } from './services/AuthService';
import { AlarmForwarder } from './services/AlarmForwarder';
import { ConfigManager } from './services/ConfigManager';
import { ShellySmokeEvent, ShellyBatteryEvent } from './types/ShellyTypes';
import { AlarmTransformer } from './services/AlarmTransformer'; 

export const setupRoutes = (app: express.Application) => {
  const alarmService = new AlarmService();
  const batteryService = new BatteryService();
  const authService = new AuthService();
  const configManager = new ConfigManager();
  const alarmTransformer = new AlarmTransformer();

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.post('/api/alarm', async (req, res) => {
    const result = await alarmService.handleAlarm(req.body);
    res.status(result.status).json(result.error ? { error: result.error } : {});
  });

  app.post('/api/battery', async (req, res) => {
    const result = await batteryService.handleBattery(req.body);
    res.status(result.status).json(result.error ? { error: result.error } : {});
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const result = authService.authenticate(username, password);
    if (result.token) {
      res.json({ token: result.token });
    } else {
      res.status(401).json({ error: result.error });
    }
  });

  app.use(passport.authenticate('jwt', { session: false }));

  app.post('/api/devices/:id/test/smoke', async (req, res) => {
    const device = await configManager.getDevice(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    const fe2Config = await configManager.getFE2Config();
    const forwarder = new AlarmForwarder(fe2Config);
    const testEvent: ShellySmokeEvent = {
      component: device.id,
      id: 0,
      event: 'alarm',
      ts: Math.floor(Date.now() / 1000),
      smoke: true,
      temperature: 25
    };
    const alarm = alarmTransformer.transformToFE2Alarm(testEvent, device, fe2Config.sender, fe2Config.authorization);
    const success = await forwarder.sendAlarm(alarm);
    res.sendStatus(success ? 200 : 500);
  });

  app.post('/api/devices/:id/test/battery', async (req, res) => {
    const device = await configManager.getDevice(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    const fe2Config = await configManager.getFE2Config();
    const forwarder = new AlarmForwarder(fe2Config);
    const testEvent: ShellyBatteryEvent = {
      component: device.id,
      id: 0,
      event: 'low_battery',
      ts: Math.floor(Date.now() / 1000),
      batteryLevel: 10
    };
    const alarm = alarmTransformer.transformBatteryAlarm(testEvent, device, fe2Config.sender, fe2Config.authorization);
    const success = await forwarder.sendAlarm(alarm);
    res.sendStatus(success ? 200 : 500);
  });

  app.get('/api/config/devices', async (req, res) => {
    const devices = await configManager.getDevices();
    res.json(devices);
  });

  app.post('/api/config/devices', async (req, res) => {
    await configManager.addDevice(req.body);
    res.sendStatus(201);
  });

  app.delete('/api/config/devices/:id', async (req, res) => {
    await configManager.removeDevice(req.params.id);
    res.sendStatus(200);
  });

  app.put('/api/config/devices/:id', async (req, res) => {
    try {
      await configManager.updateDevice(req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(404).json({ error: 'Device not found' });
    }
  });

  app.get('/api/config/fe2', async (req, res) => {
    const config = await configManager.getFE2Config();
    res.json(config);
  });

  app.post('/api/config/fe2', async (req, res) => {
    await configManager.setFE2Config(req.body);
    res.sendStatus(200);
  });
};
