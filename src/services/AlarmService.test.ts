import { AlarmService } from './AlarmService';
import { ConfigManager } from './ConfigManager';
import { AlarmTransformer } from './AlarmTransformer';
import { AlarmForwarder } from './AlarmForwarder';
import { ShellySmokeEvent } from '../types/ShellyTypes';

// Mock dependencies
jest.mock('./ConfigManager');
jest.mock('./AlarmTransformer');
jest.mock('./AlarmForwarder');

describe('AlarmService', () => {
    let alarmService: AlarmService;
    let mockGetDevice: jest.Mock;
    let mockGetFE2Config: jest.Mock;
    let mockTransformToFE2Alarm: jest.Mock;
    let mockSendAlarm: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup mock functions
        mockGetDevice = jest.fn();
        mockGetFE2Config = jest.fn();
        mockTransformToFE2Alarm = jest.fn();
        mockSendAlarm = jest.fn();
        
        // Configure mock implementations
        (ConfigManager as jest.MockedClass<typeof ConfigManager>).mockImplementation(() => ({
            getDevice: mockGetDevice,
            getFE2Config: mockGetFE2Config
        } as unknown as ConfigManager));
        
        (AlarmTransformer as jest.MockedClass<typeof AlarmTransformer>).mockImplementation(() => ({
            transformToFE2Alarm: mockTransformToFE2Alarm
        } as unknown as AlarmTransformer));
        
        (AlarmForwarder as jest.MockedClass<typeof AlarmForwarder>).mockImplementation(() => ({
            sendAlarm: mockSendAlarm
        } as unknown as AlarmForwarder));
        
        alarmService = new AlarmService();
    });

    test('should return status 404 when device is not found', async () => {
        const event = { event: 'alarm', component: 'unknown_device' } as ShellySmokeEvent;
        mockGetDevice.mockResolvedValue(null);
        
        const result = await alarmService.handleAlarm(event);
        
        expect(result).toEqual({ status: 404, error: 'Device not found' });
        expect(mockGetDevice).toHaveBeenCalledWith('unknown_device');
        expect(mockGetFE2Config).not.toHaveBeenCalled();
    });

    test('should return status 200 when alarm is successfully sent', async () => {
        const event = { event: 'alarm', component: 'device1' } as ShellySmokeEvent;
        const device = { id: 'device1', name: 'Device 1' };
        const fe2Config = { sender: 'sender1', authorization: 'auth1' };
        const alarm = { data: 'alarm data' };
        
        mockGetDevice.mockResolvedValue(device);
        mockGetFE2Config.mockResolvedValue(fe2Config);
        mockTransformToFE2Alarm.mockReturnValue(alarm);
        mockSendAlarm.mockResolvedValue(true);
        
        const result = await alarmService.handleAlarm(event);
        
        expect(result).toEqual({ status: 200 });
        expect(mockGetDevice).toHaveBeenCalledWith('device1');
        expect(mockGetFE2Config).toHaveBeenCalled();
        expect(mockTransformToFE2Alarm).toHaveBeenCalledWith(
            event, device, fe2Config.sender, fe2Config.authorization
        );
        expect(mockSendAlarm).toHaveBeenCalledWith(alarm);
    });

    test('should return status 500 when alarm sending fails', async () => {
        const event = { event: 'alarm', component: 'device1' } as ShellySmokeEvent;
        const device = { id: 'device1', name: 'Device 1' };
        const fe2Config = { sender: 'sender1', authorization: 'auth1' };
        const alarm = { data: 'alarm data' };
        
        mockGetDevice.mockResolvedValue(device);
        mockGetFE2Config.mockResolvedValue(fe2Config);
        mockTransformToFE2Alarm.mockReturnValue(alarm);
        mockSendAlarm.mockResolvedValue(false);
        
        const result = await alarmService.handleAlarm(event);
        
        expect(result).toEqual({ status: 500 });
        expect(mockSendAlarm).toHaveBeenCalledWith(alarm);
    });
});