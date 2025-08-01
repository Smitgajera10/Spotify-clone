#!/usr/bin/env bash

# Exit on errors
set -o errexit

# Install dependencies
npm install

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome