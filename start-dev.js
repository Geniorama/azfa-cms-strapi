#!/usr/bin/env node

'use strict';

const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno del archivo .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

// También cargar .env si existe
dotenv.config({ path: path.join(__dirname, '.env') });

// Mostrar las variables cargadas para debug
console.log('Variables de entorno cargadas:');
console.log('HOST:', process.env.HOST);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Iniciar Strapi usando el comando estándar
const { spawn } = require('child_process');
const strapiProcess = spawn('npx', ['strapi', 'develop'], {
  stdio: 'inherit',
  shell: true
});

strapiProcess.on('error', (error) => {
  console.error('Error al iniciar Strapi:', error);
  process.exit(1);
});
