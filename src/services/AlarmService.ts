import { ConfigManager } from './ConfigManager';
import { AlarmTransformer } from './AlarmTransformer';
import { AlarmForwarder } from './AlarmForwarder';
import { ShellySmokeEvent } from '../types/ShellyTypes';

export class AlarmService {
  private configManager = new ConfigManager();
  private alarmTransformer = new AlarmTransformer();

  public async handleAlarm(event: ShellySmokeEvent) {
    if (event.event !== 'alarm') {
      return { status: 200 };
    }

    const device = await this.configManager.getDevice(event.component);
    if (!device) {
      return { status: 404, error: 'Device not found' };
    }

    const fe2Config = await this.configManager.getFE2Config();
    const forwarder = new AlarmForwarder(fe2Config);
    const alarm = this.alarmTransformer.transformToFE2Alarm(event, device, fe2Config.sender, fe2Config.authorization);
    const success = await forwarder.sendAlarm(alarm);

    return { status: success ? 200 : 500 };
  }
}
