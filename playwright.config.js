import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests', workers:1, fullyParallel:false,
  use:{baseURL:'http://localhost:3100', headless:true, launchOptions:{executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']}},
  webServer:{command:'PORT=3100 TAVOLA_DATA_DIR=/tmp/tavola-e2e-data node server.js',url:'http://localhost:3100/api/state',reuseExistingServer:false},
});
