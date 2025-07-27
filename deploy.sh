#!/bin/bash

REPO=murb
cd "$HOME/$REPO"
sudo su
git pull
# Install pnpm globally if not already installed
command -v pnpm >/dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }

pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pnpm run build

pm2 describe website > /dev/null 2>&1
STATUS=$?

if [ $STATUS -eq 0 ]; then
    echo "PM2 process 'website' is running. Restarting it..."
    pm2 restart website
else
    echo "PM2 process 'website' is not running. Starting a new process..."
    pm2 start pnpm --name website -- start
fi

# Manage WebSocket server (server.js)
cd websocket
pnpm install --frozen-lockfile
pm2 describe websocket-server > /dev/null 2>&1
STATUS_WS=$?

if [ $STATUS_WS -eq 0 ]; then
    echo "PM2 process 'websocket-server' is running. Restarting it..."
    pm2 restart websocket-server
else
    echo "PM2 process 'websocket-server' is not running. Starting a new process..."
    pm2 start server.js --name websocket-server
fi

pm2 save
