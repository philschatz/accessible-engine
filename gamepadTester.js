var GamePad = require('node-gamepad')
const config = require('node-gamepad/controllers/ps4/dualshock4v2')
console.log(config)
var controller = new GamePad('ps4/dualshock4v2')
try {
  controller.connect()

  config.buttons.forEach(({name}) => {
    console.log(`Supports ${name}:press and :release`)
    controller.on(`${name}:press`, () => { console.log(`${name}:press`); console.log(controller._states)})
    controller.on(`${name}:release`, () => { console.log(`${name}:release`); console.log(controller._states) })
  })
  // config.joysticks.forEach(({name}) => {
  //   console.log(`Supports ${name}:move({x,y})`)
  //   controller.on(`${name}:move`, (a) => console.log(`${name}:move`, a))
  // })    
} catch (e) {
  console.error('Could not find PS4 dual-shock controller.')
  console.error(e)
}

// Supports dpadUp:press and :release
// Supports dpadLeft:press and :release
// Supports dpadRight:press and :release
// Supports dpadDown:press and :release
// Supports options:press and :release
// Supports share:press and :release
// Supports x:press and :release
// Supports circle:press and :release
// Supports square:press and :release
// Supports triangle:press and :release
// Supports r1:press and :release
// Supports r2:press and :release
// Supports l1:press and :release
// Supports l2:press and :release
// Supports touch:press and :release
// Supports psx:press and :release
// Supports l3:press and :release
// Supports r3:press and :release
// Supports left:move({x,y})
// Supports right:move({x,y})