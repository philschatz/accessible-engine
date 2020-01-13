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