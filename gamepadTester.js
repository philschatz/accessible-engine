const gamepad = require('gamepad')

gamepad.init()

// Create a game loop and poll for events
setInterval(gamepad.processEvents, 16)
// Scan for new gamepads as a slower rate
setInterval(gamepad.detectDevices, 500)

// Listen for button up events on all gamepads
gamepad.on('attach', (id, device) => {
  console.log('gamepad attached. Desc, vendor, product: ', device.description, device.vendorID, device.productID)
})

// gamepad.on('up',   (id, num) => console.log('gamepad up', id, num))
gamepad.on('down', (id, num) => console.log('gamepad down', num))


// CLUSTER_TOP = 3
// CLUSTER_BOTTOM = 1
// CLUSTER_LEFT = 0
// CLUSTER_RIGHT = 2

// BUMPER_TOP_LEFT = 4
// BUMPER_TOP_RIGHT = 5

// BUMPER_BOTTOM_LEFT = 6
// BUMPER_BOTTOM_RIGHT = 7

// SHARE = 8
// OPTIONS = 9
// TOUCHPAD = 13
// POWER = 12
// LEFT_ANALOG = 10
// RIGHT_ANALOG = 11
