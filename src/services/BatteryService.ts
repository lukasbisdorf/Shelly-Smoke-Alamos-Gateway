import { ConfigManager } from './ConfigManager';
import { AlarmTransformer } from './AlarmTransformer';
import { AlarmForwarder } from './AlarmForwarder';
import { ShellyBatteryEvent } from '../types/ShellyTypes';

export class BatteryService {
  private configManager = new ConfigManager();
  private alarmTransformer = new AlarmTransformer();

  public async handleBattery(event: ShellyBatteryEvent) {
    if (event.event !== 'low_battery') {
      return { status: 200 };
    }

    const device = await this.configManager.getDevice(event.component);
    if (!device) {
      return { status: 404, error: 'Device not found' };
    }

    const fe2Config = await this.configManager.getFE2Config();
    const forwarder = new AlarmForwarder(fe2Config);
    const alarm = this.alarmTransformer.transformBatteryAlarm(event, device, fe2Config.sender, fe2Config.authorization);
    const success = await forwarder.sendAlarm(alarm);

    return { status: success ? 200 : 500 };
  }
}
