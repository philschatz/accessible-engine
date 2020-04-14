# Accessible Game Engine

# Try it out

## Online

Click to play

[![Play online wiht a screenreader](https://user-images.githubusercontent.com/253202/79275785-743ddb00-7e6c-11ea-8039-32cb74d5efa7.gif)
](https://philschatz.com/game-engine/)

**Tip:** Try plugging in an XBox or PS3/4 controller... it should work

## In a terminal

Yes, you read that right. You can play these games in a terminal.
See the bottom of this README for how.

You can even plug in a PS4 or XBox controller and play!


# Features & Reasons

In order to make games accesible there are a few restrictions that need to be placed on game development.

See [./src/akurra/](./src/akurra/) for the first few levels of https://akurra-game.com . The code still needs a little :soap: :water: :sparkles: TLC so [./docs.md](./docs.md) is a better place to start if you are interested in how a game is built.

## Sprites & Animations

- the engine needs to know about objects, not sprites. This is so we can report when an object moved or changed
- Animation sprites need to be grouped together so they can be ignored for non-sighted users
- Optionally, each sprite should have a description of how it works and if it interacts with any other objects
  - e.g. "Touching the Red Gong will cause the Red Pillar to disappear"

## Time & Space

- play needs to occur on a grid so that there are fewer things to keep track of in one's head (chess board vs every pixel on a screen)
- progression should be based on the user's input rather than time (e.g. flying bats)
  - This is so that the user can pause, inspect what the state of the game is, actively choose when to advance
- Undo should be an option because people "try out" approaches in their head and it is useful to "try out" an approach and then inspect what actually changed

## Dialogs & Inventory windows

- dialogs need to be created through the engine. This is so we can print the dialog out to the user
- overlay information like the inventory need to be drawn through the engine. This is so we can print when changes to your inventory occur

## Gamepad

There are many gamepads available to purchase, and it is very unreasonable to ask games to implement all controllers.

However, if games canare able to request to use certain buttons (see the [Gamepad API's Standard Layout](https://w3c.github.io/gamepad/#dfn-standard-gamepad-layout)) then they can be more-easily mapped to other controllers.

## Design Notes

For more design notes on implementing your own game, see [./docs.md](./docs.md)


# Terminal

## Windows Powershell

1. Install NodeJS by either:
  - via https://nodejs.org
  - or install https://chocolatey.org/install and then run `cinst node.install`
1. Get the source code by either:
  - `git clone https://github.com/philschatz/{this_repo_name}`
  - or run `npx {this_repo_name}` to download and run it all in one
1. Install packages and run
  1. run `npm install`
  1. run `npm start`

If your powershell is too small (it probably is) you can press Ctrl+C
and set it to be at least 384x224.

## macOS and linux

There are 2 easy ways:

- clone this repo, run `npm install && npm start`
- run `npx {this_repo_name} npm start`
