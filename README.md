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
