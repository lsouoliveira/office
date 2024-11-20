#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Backup files
echo "Backing up files..."
if [ -f ./office/server/map.json ]; then
    cp ./office/server/map.json ./office/server/map.json.bak
    echo "map.json backed up."
else
    echo "Warning: map.json not found. Backup skipped."
fi

if [ -f ./office/server/server.json ]; then
    cp ./office/server/server.json ./office/server/server.json.bak
    echo "server.json backed up."
else
    echo "Warning: server.json not found. Backup skipped."
fi

if [ -f ./office/server/main.db ]; then
    cp ./office/server/main.db ./office/server/main.db.bak
    echo "main.db backed up."
else
    echo "Warning: main.db not found. Backup skipped."
fi
echo "Backup completed."

# Pull the latest changes
echo "Pulling the latest changes..."
cd ./office
git fetch
git reset --hard origin/main
echo "Pull completed."

# Restore backup files
echo "Restoring backup files..."
if [ -f ./office/server/map.json.bak ]; then
    cp ./office/server/map.json.bak ./office/server/map.json
    echo "map.json restored from backup."
else
    echo "Warning: Backup file map.json.bak not found. Skipping restore."
fi

if [ -f ./office/server/server.json.bak ]; then
    cp ./office/server/server.json.bak ./office/server/server.json
    echo "server.json restored from backup."
else
    echo "Warning: Backup file server.json.bak not found. Skipping restore."
fi

if [ -f ./office/server/main.db.bak ]; then
    cp ./office/server/main.db.bak ./office/server/main.db
    echo "main.db restored from backup."
else
    echo "Warning: Backup file main.db.bak not found. Skipping restore."
fi
echo "Backup restore completed."

# Build the server files
echo "Building server files..."
cd ./server
npm install
npm run build
echo "Main server built."

cd ../pong_server
npm install
npm run build
echo "Tennis server built."

# Update client server URLs
echo "Updating client server URLs..."
cd ../client
for file in dist/assets/index-*.js; do
    sed -i 's|ws://localhost:3000|wss://hostname|g' "$file"
    sed -i 's|ws://localhost:3001|wss://tennis.hostname|g' "$file"
    sed -i 's|http://localhost:3000/api|https://hostname/api|g' "$file"
done
echo "Client server URLs updated."

# Start or restart servers with PM2
echo "Starting or restarting servers with PM2..."
cd ..
pm2 startOrRestart ./pm2.config.js
echo "Servers managed by PM2."

echo "Deployment completed successfully."
