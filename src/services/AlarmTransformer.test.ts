import { AlarmTransformer } from './AlarmTransformer';
import { ShellySmokeEvent, ShellyBatteryEvent, ShellyDevice } from '../types/ShellyTypes';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid for consistent testing
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid')
}));

describe('AlarmTransformer', () => {
    let transformer: AlarmTransformer;
    let mockSmokeEvent: ShellySmokeEvent;
    let mockBatteryEvent: ShellyBatteryEvent;
    let mockDevice: ShellyDevice;
    const mockSender = 'testSender';
    const mockAuth = 'testAuth';
    
    beforeEach(() => {
        transformer = new AlarmTransformer();
        
        mockSmokeEvent = {
            ts: 1625097600, // July 1, 2021, 00:00:00 UTC
            temperature: 25.5,
            component: 'smoke',
            id: 0,
            event: 'alarm',
            smoke: true
        };
        
        mockBatteryEvent = {
            ts: 1625097600,
            batteryLevel: 15,
            component: 'battery',
            id: 0,
            event: 'low_battery'
        };
        
        mockDevice = {
            id: 'test-device-id',
            name: 'Bedroom Smoke Detector',
            location: {
                coordinates: [48.123, 11.456],
                street: 'Test Street',
                house: '123',
                city: 'Test City'
            },
            unit: 'FireUnit1',
            batteryUnit: 'BatteryUnit1'
        };
    });

    describe('transformToFE2Alarm', () => {
        test('should correctly transform smoke alarm data', () => {
            const result = transformer.transformToFE2Alarm(mockSmokeEvent, mockDevice, mockSender, mockAuth);
            
            expect(result).toEqual({
                type: 'ALARM',
                timestamp: '2021-07-01T00:00:00.000Z',
                sender: mockSender,
                authorization: mockAuth,
                data: {
                    externalId: 'mocked-uuid',
                    keyword: 'BMA',
                    keyword_description: 'Interner Brandmeldealarm',
                    message: [
                        'Rauchmelder Bedroom Smoke Detector hat ausgelöst',
                        'Temperatur: 25.5°C'
                    ],
                    location: {
                        coordinate: [48.123, 11.456],
                        street: 'Test Street',
                        house: '123',
                        city: 'Test City'
                    },
                    units: [{
                        address: 'FireUnit1'
                    }]
                }
            });
        });

        test('should handle different temperatures', () => {
            mockSmokeEvent.temperature = 100;
            const result = transformer.transformToFE2Alarm(mockSmokeEvent, mockDevice, mockSender, mockAuth);
            expect(result.data.message[1]).toBe('Temperatur: 100°C');
        });

        test('should correctly format timestamp', () => {
            mockSmokeEvent.ts = 1609459200; // 2021-01-01T00:00:00.000Z
            const result = transformer.transformToFE2Alarm(mockSmokeEvent, mockDevice, mockSender, mockAuth);
            expect(result.timestamp).toBe('2021-01-01T00:00:00.000Z');
        });
    });

    describe('transformBatteryAlarm', () => {
        test('should correctly transform battery alarm data', () => {
            const result = transformer.transformBatteryAlarm(mockBatteryEvent, mockDevice, mockSender, mockAuth);
            
            expect(result).toEqual({
                type: 'ALARM',
                timestamp: '2021-07-01T00:00:00.000Z',
                sender: mockSender,
                authorization: mockAuth,
                data: {
                    externalId: 'mocked-uuid',
                    keyword: 'Battery',
                    keyword_description: 'Batteriewarnung',
                    message: [
                        'Batteriewarnung Bedroom Smoke Detector',
                        'Batterie-Level: 15%'
                    ],
                    location: {
                        coordinate: [48.123, 11.456],
                        street: 'Test Street',
                        house: '123',
                        city: 'Test City'
                    },
                    units: [{
                        address: 'BatteryUnit1'
                    }]
                }
            });
        });

        test('should handle different battery levels', () => {
            mockBatteryEvent.batteryLevel = 5;
            const result = transformer.transformBatteryAlarm(mockBatteryEvent, mockDevice, mockSender, mockAuth);
            expect(result.data.message[1]).toBe('Batterie-Level: 5%');
        });

        test('should use the correct batteryUnit', () => {
            mockDevice.batteryUnit = 'CustomBatteryUnit';
            const result = transformer.transformBatteryAlarm(mockBatteryEvent, mockDevice, mockSender, mockAuth);
            expect(result.data.units[0].address).toBe('CustomBatteryUnit');
        });
    });

    test('should generate unique IDs for each alarm', () => {
        (uuidv4 as jest.Mock).mockImplementationOnce(() => 'uuid-1');
        (uuidv4 as jest.Mock).mockImplementationOnce(() => 'uuid-2');
        
        const smokeAlarm = transformer.transformToFE2Alarm(mockSmokeEvent, mockDevice, mockSender, mockAuth);
        const batteryAlarm = transformer.transformBatteryAlarm(mockBatteryEvent, mockDevice, mockSender, mockAuth);
        
        expect(smokeAlarm.data.externalId).toBe('uuid-1');
        expect(batteryAlarm.data.externalId).toBe('uuid-2');
    });
});