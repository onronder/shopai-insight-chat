#!/bin/bash

# Exit on error
set -e

echo "Building the app..."
npm run build

echo "Deploying to Shopify..."

# Check if we're authenticated with Shopify
if ! shopify auth check; then
  echo "Authenticating with Shopify..."
  shopify auth login
fi

# Create an app if it doesn't exist
if ! shopify app info > /dev/null 2>&1; then
  echo "Creating Shopify app..."
  shopify app create
fi

# Deploy the app
echo "Deploying app to Shopify..."
shopify app deploy

echo "Deployment completed!" 