/*************
 * This file used to interact serial device on USB port
 * Scanners are configured
 */
require('dotenv').config({ path: './.env' });
const logger = require('./logger.middleware');
const SerialPort = require('serialport');

const rgbHubPath = process.env.RGB_HUB_PATH;
const rgbHubBaudrate = Number(process.env.RGB_HUB_BAUDRATE) || 115200;
const rgbHubCycleInMilis = Number(process.env.RGB_HUB_SERIAL_CYCLE) || 100;
const rgbHubDebugMode = process.env.RGB_DEBUG_MODE;

let isRgbHubOpen = false

let messageBufferFromRgbHub = ''

let messageInQueue = []
let lastCallInMilis = 0
let reconnectHubInterval

//  NEED TO CONFIG SERIAL PORT FIRST, READ 'README.md'
const rgbHub = new SerialPort(rgbHubPath, {
  baudRate: rgbHubBaudrate,
  autoOpen: false
});

rgbHub.on('open', function () {
  isRgbHubOpen = true
  clearInterval(reconnectHubInterval)
  logger.info('rgb hub opened')
});

rgbHub.on('data', function (data) {
  const value = String(data).trim()
  if (messageBufferFromRgbHub == '\n') {
    logger.debug(messageBufferFromRgbHub)
    messageBufferFromRgbHub = ''
  }
  else
    messageBufferFromRgbHub += value
});

rgbHub.on('close', () => {
  logger.warn('Rgb hub closed')
  reconnectHubInterval = setInterval(() => {
    rgbHub.open((err) => {
      //
    });
  }, 10000)
});

rgbHub.on('error', (err) => {
  logger.error('Rgb hub error', { error: err })
});

/**
 * 
 * @param {String} message 
 */
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
        if (err) logger.error({ message: 'Cannot write to rgb hub', error: err });
        if (rgbHubDebugMode == 'true');
      });
    }, delayTimeInMilis)
    lastCallInMilis += rgbHubCycleInMilis
  }
  else {
    setImmediate(() => {
      rgbHub.write(messageToRgbHub, (err, res) => {
        if (err) logger.error({ message: 'Cannot write to rgb hub', error: err });
        if (rgbHubDebugMode == 'true');
      });
    })
    lastCallInMilis = presentInMilis
  }
  messageInQueue.pop()
}

rgbHub.open((err) => {
  if (err) logger.error('Can not open rgbHub', { error: err });
  reconnectHubInterval = setInterval(() => {
    rgbHub.open((err) => {
      //
    });
  }, 10000)
});

module.exports = { write: queue }