import { ShellySmokeEvent, ShellyBatteryEvent, ShellyDevice } from '../types/ShellyTypes';
import { AlamosFE2Alarm } from '../types/AlamosTypes';
import { v4 as uuidv4 } from 'uuid';

export class AlarmTransformer {
  transformToFE2Alarm(
    event: ShellySmokeEvent, 
    device: ShellyDevice, 
    sender: string, 
    authorization: string
  ): AlamosFE2Alarm {
    return {
      type: 'ALARM',
      timestamp: new Date(event.ts * 1000).toISOString(),
      sender,
      authorization,
      data: {
        externalId: uuidv4(),
        keyword: 'BMA',
        keyword_description: 'Interner Brandmeldealarm',
        message: [
          `Interner Brandmeldealarm`,
          `Rauchmelder ${device.name} hat ausgelöst`,
        ],
        location: {
          coordinate: device.location.coordinates,
          street: device.location.street,
          house: device.location.house,
          city: device.location.city
        },
        units: [{
          address: device.unit
        }]
      }
    };
  }
}
