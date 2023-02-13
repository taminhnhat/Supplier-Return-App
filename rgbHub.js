/*************
 * This file used to interact serial device on USB port
 * Scanners are configured
 */
const fs = require("fs");
require('dotenv').config({ path: './.env' });
const SerialPort = require('serialport');

const logger = require('./logger/logger');

const FILE_NAME = 'serial.js  ';

const rgbHubPath = process.env.RGB_HUB_PATH;
const rgbHubBaudrate = Number(process.env.RGB_HUB_BAUDRATE) || 115200;
const rgbHubCycleInMilis = Number(process.env.RGB_HUB_SERIAL_CYCLE) || 100;
const rgbHubDebugMode = process.env.RGB_DEBUG_MODE;

let isRgbHubOpen = false

let messageBufferFromRgbHub = ''

let messageInQueue = []
let lastCallInMilis = 0

//  NEED TO CONFIG SERIAL PORT FIRST, READ 'README.md'
const rgbHub = new SerialPort(rgbHubPath, {
  baudRate: rgbHubBaudrate,
  autoOpen: false
});

rgbHub.on('open', function () {
  isRgbHubOpen = true
  logger.debug({ message: 'rgb hub opened', location: FILE_NAME })
});

rgbHub.on('data', function (data) {
  const value = String(data).trim()
  if (messageBufferFromRgbHub == '\n') {
    console.log(messageBufferFromRgbHub)
    messageBufferFromRgbHub = ''
  }
  else
    messageBufferFromRgbHub += value
  fs.writeFile('../rgbHub.log', value, (err) => {
    if (err) console.log(err)
  })
});

rgbHub.on('close', () => {
  console.log('Rgb hub closed')
});

rgbHub.on('error', (err) => {
  console.log('Rgb hub error', err.message)
});

let lastTimeEmitToRgbHub = Date.now();
let lastMessageTime = Date.now()
let emitTorgbHubComplete = true;
/**
 * 
 * @param {String} message 
 */
function rgbHubWrite(message) {
  const temp = Date.now()
  const triggerTime = Date.now() - lastMessageTime
  const deltaTime = Date.now() - lastTimeEmitToRgbHub;
  let delayTime = 0
  if (isRgbHubOpen == false) return

  if (deltaTime > rgbHubCycleInMilis && emitTorgbHubComplete == true) {
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
      rgbHubWrite(message);
    }, rgbHubCycleInMilis - deltaTime);
  }
  return true
};

function queue(message) {
  messageInQueue.push(message)
  next()
}

function next() {
  let loadingQueue = messageInQueue
  // messageInQueue.forEach((value, index) => {
  //   //
  // })
  // while (loadingQueue.length > 0) {
  // }
  const messageToRgbHub = loadingQueue[loadingQueue.length - 1]
  if (messageToRgbHub == undefined) {
    return
  }
  const presentInMilis = Date.now()
  const delayTimeInMilis = lastCallInMilis + rgbHubCycleInMilis - presentInMilis
  if (delayTimeInMilis > 0) {
    setTimeout(() => {
      rgbHub.write(messageToRgbHub, (err, res) => {
        if (err) logger.error({ message: 'Cannot write to rgb hub', value: err, location: FILE_NAME });
        if (rgbHubDebugMode == 'true');
        console.log(`${Date.now()}-emit to rgb hub:${String(messageToRgbHub).trim()}`);
      });
    }, delayTimeInMilis)
    lastCallInMilis += rgbHubCycleInMilis
  }
  else {
    setImmediate(() => {
      rgbHub.write(messageToRgbHub, (err, res) => {
        if (err) logger.error({ message: 'Cannot write to rgb hub', value: err, location: FILE_NAME });
        if (rgbHubDebugMode == 'true');
        console.log(`${Date.now()}-emit to rgb hub:${String(messageToRgbHub).trim()}`);
      });
    })
    lastCallInMilis = presentInMilis
  }
  messageInQueue.pop()
}

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
  //   }
  // });
  rgbHubWrite('STT\n');
}

// setInterval(rgbHubCheckHealth, 60000);

module.exports = { write: queue }