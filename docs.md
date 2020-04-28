These are design notes and may be out of date.

# Overview

Programming an accessible game should be non-intrusive.
This engine targets Sokoban and SNES/Gameboy-era Zelda games.

As a result, there are a few "abstractions" that make accessibility easy:

### the game registers which Gamepad buttons it will listen to

As a result, the player can choose how the keys are mapped... to keys on a keyboard, a touch interface, or even remapping to different buttons on the gamepad (e.g. if they are single-handed or do not have a thumb)

### the game does not draw dialogs directory

Instead, it calls a function and passes the dialog text.
This is so that engine can read out via a screenreader.

### the game does not directly draw the overlay

Instead, it updates a key-value map that describes what is in the overlay.

Examples of key-value fields can be: health, hearts, current_weapon, weapons.

This is done so that any changes to these fields can be read out via a screenreader.

### the game creates/moves objects and does not draw pixels directly

This is done for a couple of reasons:

1. the engine can speak whenever an object changes
1. the engine can ignore animations and other changes that do not actually change the state of objects in the game


## Game

A game needs to implement 2 required functions and may implement 3 optional ones: 
- `load(...)`: loads all the sprites, specifies the screen grid size, and returns which generic gamepad buttons it will listen to
- `init(...)`: initializes all the rooms, objects, and any update functions on the objects.
  - In this game the player interacts with objects so the player has an update function

## Optional Game functions

In order to provide accessibility, the game engine cannot draw individual 
pixels and lines because those would not make sense to someone without sight.
Instead, in order to show a dialog box or draw an overlay, the game creator
needs to pass the relevant information (how much health the player has, 
how many keys they have, etc) as key/value pairs to the game engine. 

If the player is using the visual UI then the game engine will then call
`drawDialog` or `drawOverlay` to draw the information on the screen.

If the player is not using a visual UI then the game engine will speak
whenever the items change (like if you take damage or gain/lose a key)


## Objects & Instances

The game contains objects that move and are created/destroyed. Examples include People, Rocks, Signs, Bats.

Individual instances of objects are created which correspond to **the** Player, a Rock at (0, 0), a Sign at (4, 10). The instances contain a Position, a sprite and orientations, and any custom information for the instance, like the number of arrows in the quiver and whether they are carrying a boomerang.

If an Object needs to change as a result of other Objects or the Gamepad, it may contain an `update()` function (see [Example](./src/akurra/logic.ts)).


## Camera

The camera moves around the map. It has an X/Y position and can follow any object (precisely, loosely, or snap to a grid)

## Sprite

A Sprite contains multiple Images. For example, a sprite may be PlayerWalkRight and contains all the images of walking to the right. An object can later flip the sprite when the player is walking left.

Images are combined into a single sprite so that a non-visual UI can ignore the animation frames and just tell the user that the player is walking right.


---

below be dragons & old notes

---

# Notes

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
