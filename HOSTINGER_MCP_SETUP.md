# 🌐 Hostinger MCP Setup Guide

## What is Hostinger MCP?

Hostinger MCP (Model Context Protocol) allows you to manage your Hostinger hosting account through AI assistants.

## Prerequisites

1. **Hostinger Account**: Active hosting account
2. **MCP Server**: Hostinger MCP server configured
3. **Access Credentials**: API keys or authentication tokens

## Setup Steps

### Step 1: Check MCP Configuration

Check your MCP configuration file (usually `~/.cursor/mcp.json` or similar):

```json
{
  "mcpServers": {
    "hostinger": {
      "command": "npx",
      "args": ["-y", "@hostinger/mcp-server"],
      "env": {
        "HOSTINGER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Step 2: Get Hostinger API Credentials

1. **Log in to Hostinger**: https://www.hostinger.com
2. **Go to**: API Settings or Developer Tools
3. **Generate** API key/token
4. **Copy** credentials

### Step 3: Configure MCP Server

Add Hostinger MCP to your MCP configuration:

```bash
# Check current MCP config
cat ~/.cursor/mcp.json

# Or check project-specific config
cat .cursor/mcp.json
```

### Step 4: Test Connection

Once configured, you can:
- List websites/hosting accounts
- Deploy applications
- Manage domains
- Configure SSL certificates
- View server status

## Available Hostinger MCP Commands

Once set up, you can use commands like:
- `list_hostinger_resources` - List all hosting resources
- `deploy_to_hostinger` - Deploy your application
- `manage_domain` - Manage domain settings
- `configure_ssl` - Set up SSL certificates

## Next Steps

1. **Configure MCP** with Hostinger credentials
2. **Test connection** to Hostinger
3. **Deploy application** to Hostinger hosting
4. **Configure domain** and SSL
5. **Set up production** environment

## Need Help?

- Hostinger Docs: https://www.hostinger.com/tutorials
- MCP Documentation: Check your MCP server docs
- Contact Hostinger Support: https://www.hostinger.com/contact

## Current Status

✅ Ready to configure Hostinger MCP
⏳ Waiting for Hostinger API credentials
⏳ Waiting for MCP server installation

