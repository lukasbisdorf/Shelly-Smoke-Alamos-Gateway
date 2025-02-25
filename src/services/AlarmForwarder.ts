import { AlamosFE2Alarm, AlamosFE2Config } from '../types/AlamosTypes';

export class AlarmForwarder {
  constructor(private config: AlamosFE2Config) {}

  async sendAlarm(alarm: AlamosFE2Alarm): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/rest/external/http/alarm/v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.authorization
        },
        body: JSON.stringify(alarm)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send alarm:', error);
      return false;
    }
  }
}
