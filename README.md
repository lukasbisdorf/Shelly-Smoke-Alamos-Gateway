## Configuring Shelly Smoke Pro Webhooks

1. Add your Shelly Smoke Pro device in the web interface
2. Click the "Webhooks" button for your device to reveal the webhook URLs
3. Log into your Shelly Smoke Pro web interface
4. Navigate to "Actions" in the menu
5. Configure two webhooks:

### Alarm Webhook
- Trigger: When smoke is detected
- URL: Copy the "Alarm Webhook" URL from the web interface
- Method: POST

### Battery Webhook
- Trigger: When battery level changes
- URL: Copy the "Battery Webhook" URL from the web interface
- Method: POST

Remember to click "Save" after configuring each webhook.

## Using the Web Interface

1. Configure FE2 Settings:
   - Enter your FE2 server URL (e.g., `http://fe2.local:80`)
   - Add your FE2 authorization token
   - Set the sender name that will appear in FE2

2. Add Shelly Smoke Devices:
   - Enter a unique device ID
   - Provide a descriptive name
   - Set the FE2 unit number for smoke alarms
   - Set the FE2 unit number for battery warnings
   - Enter the device location details
   - Click "Add Device"

3. Managing Devices:
   - Click "Webhooks" to see the webhook URLs for each device
   - Use "Copy" buttons to copy URLs to clipboard
   - "Edit" allows you to modify device settings
   - "Remove" deletes the device configuration

4. Configure Shelly Device Webhooks:

## Architecture

The application serves as a bridge between Shelly Smoke Pro devices and FE2 alarm systems. It consists of three main components:

1. Web Interface - For configuration and device management
2. Webhook API - Receives alerts from Shelly devices
3. FE2 Client - Forwards alerts to the FE2 system

### Communication Flow

```mermaid
graph TB
    A[Shelly Smoke Pro] -->|Webhook| B[Webhook API]
    B --> C[Event Handler]
    C --> D[FE2 Client]
    D -->|HTTP POST| E[FE2 Server]
    F[Web Interface] -->|Configuration| G[(Config Store)]
    G -.->|Read| C
```

### API Documentation

#### Webhook Endpoints

1. Alarm Webhook
```
POST /api/webhook/{deviceId}/alarm
```
Payload example:
```json
{
    "events": {
        "smoke": true
    }
}
```

2. Battery Webhook
```
POST /api/webhook/{deviceId}/battery
```
Payload example:
```json
{
    "battery": {
        "percent": 85
    }
}
```

#### Configuration API

1. Device Management
```
GET /api/devices
POST /api/devices
PUT /api/devices/{deviceId}
DELETE /api/devices/{deviceId}
```

2. Settings
```
GET /api/settings
PUT /api/settings
```

### FE2 Integration

The application communicates with FE2 using its HTTP interface. Alerts are sent as POST requests with the following format:

```
POST http://{fe2-server}/msgservice/msg
```
Payload:
```json
{
    "sender": "configured-sender-name",
    "unit": "configured-unit-number",
    "text": "Smoke detected at {location}"
}
```

### Error Handling

- Failed webhooks return HTTP 400 for invalid requests
- Configuration errors return HTTP 422 with error details
- FE2 communication failures are logged and retried
- Device configuration validation ensures proper setup

### Security Considerations

- HTTPS recommended for production deployment
- FE2 authentication token required
- Input validation on all API endpoints
- Rate limiting on webhook endpoints

## Configuration

The `AuthService` uses environment variables to configure the admin credentials and JWT secret. You can set these variables in your environment or in a `.env` file at the root of your project.

### Environment Variables

- `ADMIN_USERNAME`: The username for the admin user (default: `admin`)
- `ADMIN_PASSWORD`: The password for the admin user (default: `password`)
- `JWT_SECRET`: The secret key used to sign the JWT tokens (default: `your_jwt_secret`)

### Example `.env` file

```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
```

Make sure to restart your application after changing these variables.
