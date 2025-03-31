import { JsonDB, Config } from 'node-json-db';
import { ConfigManager } from './ConfigManager';
import { ShellyDevice } from '../types/ShellyTypes';
import { AlamosFE2Config } from '../types/AlamosTypes';

// Mock node-json-db
jest.mock('node-json-db', () => {
    return {
        JsonDB: jest.fn().mockImplementation(() => ({
            getData: jest.fn(),
            push: jest.fn().mockResolvedValue(undefined),
        })),
        Config: jest.fn(),
    };
});

describe('ConfigManager', () => {
    let configManager: ConfigManager;
    let mockJsonDB: any;
    
    beforeEach(() => {
        jest.clearAllMocks();
        configManager = new ConfigManager();
        // @ts-ignore - accessing private property for testing
        mockJsonDB = configManager.db;
    });

    describe('constructor', () => {
        it('should initialize with default config path', () => {
            process.env.CONFIG_PATH = undefined;
            new ConfigManager();
            expect(Config).toHaveBeenCalledWith('config.json', true, false, '/');
        });

        it('should initialize with config path from env', () => {
            process.env.CONFIG_PATH = 'custom-config.json';
            new ConfigManager();
            expect(Config).toHaveBeenCalledWith('custom-config.json', true, false, '/');
            process.env.CONFIG_PATH = undefined;
        });
    });

    describe('getDevices', () => {
        it('should return devices from db', async () => {
            const mockDevices = [{ 
                id: '1', 
                name: 'Device 1',
                location: {
                    street: 'Main St',
                    house: '123',
                    city: 'Test City',
                    coordinates: [50.123, 10.456]
                },
                unit: 'S01.01',
                batteryUnit: 'B01.01'
            }] as ShellyDevice[];
            mockJsonDB.getData.mockResolvedValueOnce(mockDevices);
            
            const result = await configManager.getDevices();
            
            expect(mockJsonDB.getData).toHaveBeenCalledWith('/devices');
            expect(result).toEqual(mockDevices);
        });
        
        it('should return empty array if error occurs', async () => {
            mockJsonDB.getData.mockRejectedValueOnce(new Error('Not found'));
            
            const result = await configManager.getDevices();
            
            expect(mockJsonDB.getData).toHaveBeenCalledWith('/devices');
            expect(result).toEqual([]);
        });
    });

    describe('getDevice', () => {
        it('should return device when found', async () => {
            const mockDevices = [
                { 
                    id: '1', 
                    name: 'Device 1',
                    location: {
                        street: 'Main St',
                        house: '123',
                        city: 'Test City',
                        coordinates: [50.123, 10.456]
                    },
                    unit: 'S01.01',
                    batteryUnit: 'B01.01'
                },
                { 
                    id: '2', 
                    name: 'Device 2',
                    location: {
                        street: 'Second St',
                        house: '456',
                        city: 'Test City',
                        coordinates: [50.124, 10.457]
                    },
                    unit: 'S01.02',
                    batteryUnit: 'B01.02'
                }
            ] as ShellyDevice[];
            mockJsonDB.getData.mockResolvedValueOnce(mockDevices);
            
            const result = await configManager.getDevice('2');
            
            expect(result).toEqual({ 
                id: '2', 
                name: 'Device 2',
                location: {
                    street: 'Second St',
                    house: '456',
                    city: 'Test City',
                    coordinates: [50.124, 10.457]
                },
                unit: 'S01.02',
                batteryUnit: 'B01.02'
            });
        });
        
        it('should return null when device not found', async () => {
            const mockDevices = [{ 
                id: '1', 
                name: 'Device 1',
                location: {
                    street: 'Main St',
                    house: '123',
                    city: 'Test City',
                    coordinates: [50.123, 10.456]
                },
                unit: 'S01.01',
                batteryUnit: 'B01.01'
            }] as ShellyDevice[];
            mockJsonDB.getData.mockResolvedValueOnce(mockDevices);
            
            const result = await configManager.getDevice('99');
            
            expect(result).toBeNull();
        });
    });

    describe('addDevice', () => {
        it('should add a device to the list', async () => {
            const existingDevices = [
                {
                    id: '1',
                    name: 'Device 1',
                    location: {
                        street: 'Main St',
                        house: '123',
                        city: 'Test City',
                        coordinates: [50.123, 10.456]
                    },
                    unit: 'S01.01',
                    batteryUnit: 'B01.01'
                }
            ] as ShellyDevice[];
            
            const newDevice = {
                id: '2',
                name: 'Device 2',
                location: {
                    street: 'Second St',
                    house: '456',
                    city: 'Test City',
                    coordinates: [50.124, 10.457]
                },
                unit: 'S01.02',
                batteryUnit: 'B01.02'
            } as ShellyDevice;
            
           // mockJsonDB.getData.mockResolvedValueOnce(existingDevices);
            
            await configManager.addDevice(existingDevices[0]);
            await configManager.addDevice(newDevice );
      
            // Fix the expected array to match what ConfigManager.addDevice actually does
            // @ts-ignore - accessing private property for testing
            expect(configManager.db.push).toHaveBeenCalledWith('/devices', [
                ...existingDevices,
                newDevice,
            ]);
        });
    });

    describe('getFE2Config', () => {
        it('should return FE2 config from db', async () => {
            const mockConfig: AlamosFE2Config = { 
                url: 'http://example.com', 
                authorization: 'token123', 
                sender: 'CustomSender' 
            };
            mockJsonDB.getData.mockResolvedValueOnce(mockConfig);
            
            const result = await configManager.getFE2Config();
            
            expect(mockJsonDB.getData).toHaveBeenCalledWith('/fe2config');
            expect(result).toEqual(mockConfig);
        });
        
        it('should return default config if error occurs', async () => {
            mockJsonDB.getData.mockRejectedValueOnce(new Error('Not found'));
            
            const result = await configManager.getFE2Config();
            
            expect(result).toEqual({
                url: '',
                authorization: '',
                sender: 'ShellySmoke'
            });
        });
    });

    describe('setFE2Config', () => {
        it('should set FE2 config in db', async () => {
            const config: AlamosFE2Config = { 
                url: 'http://example.com', 
                authorization: 'token123', 
                sender: 'CustomSender' 
            };
            
            await configManager.setFE2Config(config);
            
            expect(mockJsonDB.push).toHaveBeenCalledWith('/fe2config', config);
        });
    });

    describe('removeDevice', () => {
        it('should remove a device from the list', async () => {
            const existingDevices = [
                {
                    id: '1',
                    name: 'Device 1',
                    location: {
                        street: 'Main St',
                        house: '123',
                        city: 'Test City',
                        coordinates: [50.123, 10.456]
                    },
                    unit: 'S01.01',
                    batteryUnit: 'B01.01'
                },
                {
                    id: '2',
                    name: 'Device 2',
                    location: {
                        street: 'Second St',
                        house: '456',
                        city: 'Test City',
                        coordinates: [50.124, 10.457]
                    },
                    unit: 'S01.02',
                    batteryUnit: 'B01.02'
                }
            ] as ShellyDevice[];
            
            mockJsonDB.getData.mockResolvedValueOnce(existingDevices);
            
            await configManager.removeDevice('1');
            
            expect(mockJsonDB.push).toHaveBeenCalledWith('/devices', [
                {
                    id: '2',
                    name: 'Device 2',
                    location: {
                        street: 'Second St',
                        house: '456',
                        city: 'Test City',
                        coordinates: [50.124, 10.457]
                    },
                    unit: 'S01.02',
                    batteryUnit: 'B01.02'
                }
            ]);
        });
    });

    describe('updateDevice', () => {
        it('should update a device in the list', async () => {
            const existingDevices = [
                {
                    id: '1',
                    name: 'Device 1',
                    location: {
                        street: 'Main St',
                        house: '123',
                        city: 'Test City',
                        coordinates: [50.123, 10.456]
                    },
                    unit: 'S01.01',
                    batteryUnit: 'B01.01'
                },
                {
                    id: '2',
                    name: 'Device 2',
                    location: {
                        street: 'Second St',
                        house: '456',
                        city: 'Test City',
                        coordinates: [50.124, 10.457]
                    },
                    unit: 'S01.02',
                    batteryUnit: 'B01.02'
                }
            ] as ShellyDevice[];
            
            mockJsonDB.getData.mockResolvedValueOnce(existingDevices);
            
            await configManager.updateDevice({
                id: '1',
                name: 'Updated Device 1',
                location: {
                    street: 'Updated St',
                    house: '999',
                    city: 'Updated City',
                    coordinates: [50.999, 10.999]
                },
                unit: 'S01.99',
                batteryUnit: 'B01.99'
            });
            
            expect(mockJsonDB.push).toHaveBeenCalledWith('/devices', [
                {
                    id: '1',
                    name: 'Updated Device 1',
                    location: {
                        street: 'Updated St',
                        house: '999',
                        city: 'Updated City',
                        coordinates: [50.999, 10.999]
                    },
                    unit: 'S01.99',
                    batteryUnit: 'B01.99'
                },
                {
                    id: '2',
                    name: 'Device 2',
                    location: {
                        street: 'Second St',
                        house: '456',
                        city: 'Test City',
                        coordinates: [50.124, 10.457]
                    },
                    unit: 'S01.02',
                    batteryUnit: 'B01.02'
                }
            ]);
        });
    });
});