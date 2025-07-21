#!/bin/bash

# MongoDB Replica Set Setup Script for Prisma
# This script configures MongoDB as a replica set to work with Prisma transactions

echo "Setting up MongoDB replica set for Prisma..."

# Step 1: Stop MongoDB service
echo "Stopping MongoDB service..."
sudo systemctl stop mongod

# Step 2: Backup current config
echo "Backing up current MongoDB configuration..."
sudo cp /etc/mongod.conf /etc/mongod.conf.backup

# Step 3: Replace MongoDB config with replica set config
echo "Updating MongoDB configuration..."
sudo cp mongod-replica.conf /etc/mongod.conf

# Step 4: Start MongoDB service
echo "Starting MongoDB service..."
sudo systemctl start mongod

# Step 5: Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

# Step 6: Initialize replica set
echo "Initializing replica set..."
mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"

# Step 7: Wait for replica set to be ready
echo "Waiting for replica set to be ready..."
sleep 10

# Step 8: Check replica set status
echo "Checking replica set status..."
mongosh --eval "rs.status()"

# Step 9: Update DATABASE_URL in .env file
echo "Updating DATABASE_URL in .env file..."
sed -i 's|DATABASE_URL=mongodb://localhost:27017/development|DATABASE_URL=mongodb://localhost:27017/development?replicaSet=rs0|g' .env

echo "MongoDB replica set setup complete!"
echo "Your new DATABASE_URL is: mongodb://localhost:27017/development?replicaSet=rs0"
echo "You can now run your Prisma application with transaction support."

