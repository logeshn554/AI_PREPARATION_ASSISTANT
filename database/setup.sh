#!/bin/bash

# Database configuration
DB_NAME="ai_interview_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "Creating database and tables..."

# Create database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist"

# Run initialization script
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./init.sql

echo "Database setup completed!"
