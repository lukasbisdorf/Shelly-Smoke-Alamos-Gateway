import { JsonDB, Config } from 'node-json-db';
import { ShellyDevice } from '../types/ShellyTypes';
import { AlamosFE2Config } from '../types/AlamosTypes';

export class ConfigManager {
  private db: JsonDB;

  constructor() {
    const configPath = process.env.CONFIG_PATH || 'config.json';
    this.db = new JsonDB(new Config(configPath, true, false, '/'));
  }

  async getDevices(): Promise<ShellyDevice[]> {
    try {
      return await this.db.getData("/devices") || [];
    } catch {
      return [];
    }
  }

  async getDevice(id: string): Promise<ShellyDevice | null> {
    const devices = await this.getDevices();
    return devices.find(d => d.id === id) || null;
  }

  async addDevice(device: ShellyDevice): Promise<void> {
    const devices = await this.getDevices();
    devices.push(device);
    await this.db.push("/devices", devices);
  }

  async getFE2Config(): Promise<AlamosFE2Config> {
    try {
      return await this.db.getData("/fe2config");
    } catch {
      return {
        url: '',
        authorization: '',
        sender: 'ShellySmoke'
      };
    }
  }

  async setFE2Config(config: AlamosFE2Config): Promise<void> {
    await this.db.push("/fe2config", config);
  }

  async removeDevice(id: string): Promise<void> {
    const devices = await this.getDevices();
    const filtered = devices.filter(d => d.id !== id);
    await this.db.push("/devices", filtered);
  }

  async updateDevice(device: ShellyDevice): Promise<void> {
    const devices = await this.getDevices();
    const index = devices.findIndex(d => d.id === device.id);
    if (index === -1) {
      throw new Error('Device not found');
    }
    devices[index] = device;
    await this.db.push("/devices", devices);
  }
}
