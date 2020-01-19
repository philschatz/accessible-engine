# Accessible Game Engine

Needs to have the following properties (unlike pico-8 or puzzlescript):

- **Engine knows about Objects** : Objects that the engine knows about and move around instead of just sprites that are drawn
  - Why? So we can tell the user that something moved. We can tell them when a property of the object changed (e.g. the user's health dropped or they are holding a hookshot)
  - e.g. Baba's "FLAG IS WIN" applies to all flag objects, while (x,y)==(4,3) only applies to one of the flags
- **Animation Sprites are grouped** : Sprites used for just animations need to be grouped so they can be ignored by a screenreader
- **Time Travel** The game needs to move based on user input rather than time
  - or give users a way to move time forwards and backwards (1st-class Undo)
- The user should know which things collide with other things
- Variant sprites should also be grouped together so the screenreader can ignore them

See [./myGame.ts](./myGame.ts) for an example


# Controllers

I tried multiple gamepad libraries but they had the following problems:

- [dualshock-controller](https://github.com/Kylir/node-dualshock-controller) only worked for PS4 controllers and only the fork contained the configuration for the v2 PS4 controller
- [gamepad](https://github.com/warp/node-gamepad#node-12-support) randomly segfaulted, the DPad was reported as a joystick, and only a fork supported node 12
- [node-gamepad](https://github.com/kaikousa/node-gamepad#dualshock4v2) only supported pressing one button at a time and only a fork contained the PS4 vs configuration
