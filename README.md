# Conway's Game of Life
The Game of Life is a Cellular Automaton devised by the British Mathematician John Horton Conway in 1970. As devised, the Game of Life is "played" on an infinite, two-dimensional orthogonal grid of "cells." Cells are either *live* or *dead*. Each generation, cells survive, die or are born according to a series of rules.
1. Any live cell with two or three neighbors survives to the next generation.
2. Any dead cell with three live neighbors becomes "alive."
3. All other live cells die in the next generation, and similarly all other dead cells stay dead.

The "seed" of the system is the initial pattern of living and dead cells. The first generation is created by applying those rules simultaneously to every cell in the seed. Births and deaths occur simultaneously. Additionally, each generation is a pure function of the preceding one.

## Implementation
This implementation of the Game of Life is done with JavaScript, using Canvas for the display. It implements a Board and Display, both as singletons with similar methods. There is also a Simulation singleton, which handles the current rules and various other things. The game loop and all other aspects are handled outside of these classes, and instead direct those objects to perform their various tasks.

The Board and Display are both buffered. They store their current generation. Their next generation is built on the buffer, and then when ready, that buffer is flipped into the active state. The Display is only responsible for interacting with canvas, while the Board actually stores the state of the game. Each generation, both are cleared, and the next generation is built cell by cell.

The only cells that are actively stored each generation are the living ones. The only cells that could be affected each generation (given the standard rules and *most* variants, see below) are these and their immediate neighbors, both living and dead. 

Each tick, for each cell in the current generation, we find all of that cell's neighbors - living and dead - and count up the ones that are alive. Edge cell neighbors are either considered permanently dead or wrapped around depending on the settings. Once we are finished counting every relevant cell's neighbors, we apply the current rules to those cells to determine whether or not they survive or become alive in the next generation. If so, we add them to that generation. Otherwise, we move on.

Once the generation has finished processing, the buffer states in the Board and Display become the new active states, at which point the canvas updates. If the Simulation is currently set to run continuously, it will continue to process generations until it is stopped. The simulation can also be stepped generation by generation manually.

## Settings
### The display
While the simulation is paused, you can click cells to turn them on and off. Test out different patterns and stuff. Go nuts.

### Edge Behavior
* **Dead**: Cells on the edge of the simulation are considered permanently dead.
* **Wrap**: Edge cells are instead wrapped to the other side.

### Simulation Speed
| Slowest | Slower | Normal | Faster | Fastest |
|--|--|--|--|--|
| 1/16 Speed | 1/8 Speed | 1/4 Speed | 1/2 Speed | Uncapped speed |

Fastest will render it as fast as your computer possibly can. On some custom rules settings its pretty cool.

### Rules
You can modify the rules here, selecting the criteria by which cells survive and are born each generation. By default, cells with 3 neighbors are born, and cells with 2 or 3 neighbors survive. (We will use the notation Bn/Sn, where B3/S23 corresponds to the rules of the standard game of life).

You are able to adjust the rules while the simulation is running, in case the state becomes stable and boring and you feel like playing god to spice things up. I personally like to add 2 or 4 to the list of birth conditions, and then disable them after things get interesting again.

**!NOTE!** :: Due to the way I handle tracking state, B0 will not turn all the blank cells with no neighbors on. In fact it wont do anything at all. But the option is still there in case I feel like fixing this in a future version.

#### Variants
There are a lot of variants you can find on the internet so I wont talk about those. Only the ones that I have personally found that are cool.
| Notation | | 
|--|--|
| B3/S23 | Standard game of life (default)
| B3/S234 | "Vines." It pretty much just looks like tangled vines that creep out and terminate at edges or in stable blinking patterns. Or like a shitty maze with no solution. Your pick. I find this one fun to toggle on and off.
| B3567/S4568 | Kind of a trippy, swarmbly chaotic mess. Call me crazy but it always seems to pulsate in sync with whatever music I am listening to.

### Randomize
Resets the simulation and then randomly determines an initial state.
Option | Living Cells
--|--
Dense | Roughly 1 in 2
Moderate | Roughly 1 in 4
Sparse | Roughly 1 in 8

### Colors
Choose the colors for the Foreground (cells) and Background (petri dish). You can also have the computer choose randomly. You can also activate this setting while the simulation is running. You know you want to.

## Other Notes
1. Technically, you can also change the size of the board. However the only way to do this right now is by changing the initial size of it. So, you can clone the repo and figure that out if you want. I might adjust this later.
2. I tried to optimize for performance over readability. I still think its pretty clear what is going on, but there are still plenty of optimizations I can do, which I might implement in future versions.