# Uploading Configuration to Zeabur

This document provides step-by-step instructions for uploading the `zeabur.config.json` configuration file to your Zeabur project.

## Prerequisites

1. Install Zeabur CLI:
   ```bash
   npm install -g @zeabur/cli
   ```

2. Authenticate with Zeabur:
   ```bash
   zeabur auth login
   ```

## Option 1: Using Zeabur CLI

1. **Find Your Project ID**:
   ```bash
   zeabur project list
   ```
   This will show all your projects. Note the ID of your `checkin-system` project.

2. **Upload the Configuration File**:
   ```bash
   zeabur config upload --project YOUR_PROJECT_ID --file zeabur.config.json
   ```
   Replace `YOUR_PROJECT_ID` with the actual project ID from step 1.

3. **Apply the Configuration**:
   ```bash
   zeabur config apply --project YOUR_PROJECT_ID
   ```
   This will apply the uploaded configuration to your project.

## Option 2: Using Zeabur Dashboard

1. **Log in to Zeabur Dashboard**:
   Go to [https://dash.zeabur.com](https://dash.zeabur.com) and log in.

2. **Navigate to Your Project**:
   Select your `checkin-system` project from the dashboard.

3. **Go to Settings**:
   Click on the "Settings" tab or gear icon.

4. **Find Configuration Section**:
   Look for "Configuration" or "Project Settings" section.

5. **Upload Configuration**:
   Click "Upload Configuration" or similar button and select the `zeabur.config.json` file.

6. **Apply Configuration**:
   After uploading, click "Apply" or "Deploy" to apply the configuration.

## Important Notes Before Uploading

Before uploading the configuration file, make sure to:

1. **Update Environment Variables**:
   - Replace `YOUR_DB_HOST`, `YOUR_DB_USER`, `YOUR_DB_PASSWORD`, and `YOUR_JWT_SECRET` with your actual values
   - Adjust any other environment variables to match your requirements

2. **Verify Repository Information**:
   - Make sure the GitHub repository name (`TerryYwt/checkin-system`) is correct
   - Confirm that the branch name (`main`) is correct

3. **Check Domain Names**:
   - Verify that the domain names in the configuration match your actual domains

4. **Resource Limits**:
   - Adjust CPU and memory limits if necessary based on your Zeabur account tier

## After Uploading

After successfully uploading and applying the configuration:

1. **Check Deployment Status**:
   ```bash
   zeabur service list --project YOUR_PROJECT_ID
   ```
   This will show the status of your services.

2. **View Logs**:
   ```bash
   zeabur logs --service YOUR_SERVICE_ID
   ```
   Replace `YOUR_SERVICE_ID` with the ID of the service you want to check.

3. **Test the Endpoints**:
   - Backend: `https://api.checkin-system.zeabur.app/api/health`
   - Frontend: `https://checkin-system.zeabur.app`

## Troubleshooting

If you encounter issues:

1. **Check Configuration Syntax**:
   Ensure the JSON file is valid with no syntax errors.

2. **Verify Permissions**:
   Make sure you have the necessary permissions to update the project configuration.

3. **Check Error Logs**:
   Look for error messages in the Zeabur dashboard or CLI output.

4. **Contact Zeabur Support**:
   If problems persist, reach out to Zeabur support with the error details. 