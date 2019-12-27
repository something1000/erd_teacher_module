const config = require('./config.json');
const finalConfig = config.production;

finalConfig.backend.address = process.env.BACKEND_ADDR || finalConfig.backend.address;

global.gConfig = finalConfig;