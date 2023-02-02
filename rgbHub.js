/*************
 * This file used to interact serial device on USB port
 * Scanners are configured
 */
const fs = require("fs");
require('dotenv').config({ path: './.env' });
const SerialPort = require('serialport');
const event = require('./event');

const logger = require('./logger/logger');

const FILE_NAME = 'serial.js  ';

const rgbHubPath = process.env.RGB_HUB_PATH;
const rgbHubBaudrate = Number(process.env.RGB_HUB_BAUDRATE) || 115200;
const rgbHubCycle = Number(process.env.RGB_HUB_SERIAL_CYCLE) || 100;
const rgbHubDebugMode = process.env.RGB_DEBUG_MODE;

//  NEED TO CONFIG SERIAL PORT FIRST, READ 'README.md'
const rgbHub = new SerialPort(rgbHubPath, {
  baudRate: rgbHubBaudrate,
  autoOpen: false
});

rgbHub.on('open', function () {
  logger.debug({ message: 'rgb hub opened', location: FILE_NAME })
  event.emit('rgbHub:opened', { message: 'RGB Hub opened' })
});

rgbHub.on('data', function (data) {
  const value = String(data).trim();
  fs.writeFile('../rgbHub.log', value, (err) => {
    if (err) console.log(err)
  })
  event.emit(`rgbHub:data`, { message: 'rgb hub data', value: value });
});

rgbHub.on('close', () => {
  event.emit('rgbHub:closed', { message: 'Back scanner closed' });
});

rgbHub.on('error', (err) => {
  event.emit('rgbHub:error', { message: 'Rgb hub error', value: err.message });
});

let lastTimeEmitToRgbHub = Date.now();
let emitTorgbHubComplete = true;
event.on('rgbHub:emit', rgbHubEmit);
/**
 * 
 * @param {String} message 
 */
function rgbHubEmit(message) {
  const deltaTime = Date.now() - lastTimeEmitToRgbHub;

  if (deltaTime > rgbHubCycle && emitTorgbHubComplete == true) {
    emitTorgbHubComplete = false;
    const messageToRgbHub = message;
    rgbHub.write(messageToRgbHub, (err, res) => {
      if (err) logger.error({ message: 'Cannot write to rgb hub', value: err, location: FILE_NAME });
      lastTimeEmitToRgbHub = Date.now();
      emitTorgbHubComplete = true;
      if (rgbHubDebugMode == 'true');
      console.log(`${Date.now()}-emit to rgb hub:${String(messageToRgbHub).trim()}`);
    });
  }
  else {
    setTimeout(() => {
      rgbHubEmit(message);
    }, rgbHubCycle - deltaTime);
  }
};

rgbHub.open((err) => {
  if (err) logger.error({ message: 'Can not open rgbHub', value: err, location: FILE_NAME });
});

/**
 * Reconnecting to serial port every 5 seconds after loosing connection
 */

function rgbHubCheckHealth() {
  // rgbHub.open((err) => {
  //   if (err) {
  //     if (err.message !== 'Port is already open')
  //       event.emit('rgbHub:error', { message: 'Rgb hub error', value: err.message });
  //   }
  // });
  rgbHubEmit('STT\n');
}

// setInterval(rgbHubCheckHealth, 60000);

module.exports = { emit: rgbHubEmit }