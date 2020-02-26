# Accessible Game Engine


## Run in a Windows Powershell terminal

Yes, you read that right! You can play the game inside a terminal.

1. Install NodeJS by either:
  - via https://nodejs.org
  - or install https://chocolatey.org/install and then run `cinst node.install`
1. Get the source code by either:
  - `git clone https://github.com/philschatz/{this_repo_name}`
  - run `npx {this_repo_name}` to download and run it all in one
1. Install packages and run
  - run `npm install`
  - run `npm start`

If your powershell is too small (it probably is) you can press Ctrl+C
and set it to be at least 384x224.



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


There is a large database of game controllers but this is the [only description of the file format I have found](https://github.com/Vladar4/sdl2_nim/blob/7f3422cd5480ba0961a1f8922ed7609326215656/sdl2/private/gamecontroller.nim#L77)



# Notes

Zelda-like game needs:

# abstraction for providing a sequence of things that happen over time (generator)

- optional cancellable method (with its own animation? or is it always immediate?)
- 

# Sprites

- sprite groups & their z-indexes or something so you can walk behind a tree
- sprites that have a set of boolean flags
- maybe some sprites can be a "vertical wall" which is useful for both Z-index calculation _and_ for hookshot/arrow shooting
- multi-height sprites (e.g. the player is tall w/ a hat)


# Maps

- tile maps (maybe multiple tiles per square for like a bridge over land & water, Big-square sprites for like a roof)


# Messaging

- popup speech bubbles (with more than just text... maybe controller keys)
- message windows (e.g. 1 at a time, optional title, require keypress)


# Items

- inventory
- binding weapon(s) to keys


# Controller

- keyboard/controller is abstracted out (game registers which keys it wants to listen to)
- multiplayer (game registers for it)
- remapping config

