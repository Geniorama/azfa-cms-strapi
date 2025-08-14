#!/usr/bin/env node

'use strict';

/**
 * This file is used to start the Strapi application
 * It's the entry point for the production build
 */

const strapi = require('@strapi/strapi');

// Start Strapi with proper configuration
strapi({
  appPath: __dirname,
  distPath: __dirname,
}).start();
