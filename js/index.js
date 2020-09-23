////////////////
// SIMULATION //
////////////////

// we use three basic types to represent our game of life:
// cells, state and the board.

// cells are duples of coordinates, implemented as an array (a)
// where x = a[0] and y = a[1]
// they are also represented as a string (or float) for use as a key 
// for the counter later
const cellF = (x, y) => [x, y]
const cellToString = cell => `${cell[0]}.${cell[1]}`
const cellFromString = str => cellF(...str.split('.').map(n => parseInt(n, 10)))
const cellsEqual = (a, b) => a[0] === b[0] && a[1] === b[1]
const getCellNeighbors = (board, cell) => {
    let neighbors = []
    const [w, h] = board
    const [x, y] = cell
    // SW
    if(y+1 < h && x-1 >= 0) {
        neighbors.push(cellF(x-1, y+1))
    }
    // SE
    if(y+1 < h && x+1 < w) {
        neighbors.push(cellF(x+1, y+1))
    }
    // NW
    if(y-1 >= 0 && x-1 >= 0) {
        neighbors.push(cellF(x-1, y-1))
    }
    // NE
    if(y-1 >= 0 && x+1 < w) {
        neighbors.push(cellF(x+1, y-1))
    }
    // W
    if(x-1 >= 0) {
        neighbors.push(cellF(x-1, y))
    }
    // E
    if(x+1 < w) {
        neighbors.push(cellF(x+1, y))
    }
    // N
    if(y-1 >= 0) {
        neighbors.push(cellF(x, y-1))
    }
    // S
    if(y+1 < h) {
        neighbors.push(cellF(x, y+1))
    }
    return neighbors
}

// a board state is just a Set of cells that are alive. we don't need to store
// dead cells. we DO need to know if the state contains a cell.
const stateContains = (state, cell) => {
    for (const c of state) {
        if (cellsEqual(cell, c)) {
            return true
        }
    }
    return false
}

// a board itself has a max height and max width. we'll just represent this
// as a duple.
const board = (maxW, maxH) => [maxW, maxH]

// now we can process each tick. we take in a board and state and
// return a new state containing the updated position.
const update = (board, state) => {
    newState = new Set()
    counter = {}
    // count each cell's neighbors. we only need to test known
    // living cells and their immediate neighbors (live or dead)
    state.forEach(cell => {
        let cn = cellToString(cell)
        if (cn in counter === false) {
            counter[cn] = 0
        }
        neighbors = getCellNeighbors(board, cell)
        neighbors.forEach(neighbor => {
            let nn = cellToString(neighbor)
            // if the neighbor isn't already being tracked in the counter,
            // we know it has one neighbor already. if it is, increment the counter.
            if (nn in counter === false) {
                counter[nn] = 1
            } else {
                counter[nn] += 1
            }
        })
    })
    // now let is decide the fate of each cell. newState is empty so
    // we will add a cell to this state if it is supposed to be alive.
    Object.keys(counter).forEach(cs => {
        curr = cellFromString(cs)
        if (stateContains(state, curr)) {
            if (counter[cs] >= 2 && counter[cs] <= 3) {
                newState.add(curr)
            }
        } else {
            if (counter[cs] === 3) {
                newState.add(curr)
            }
        }
    })
    return newState
}


////////////
// CANVAS //
////////////

// we are using the Canvas element to display our game of life.
// pretty much all of these functions have side effects because
// they are interacting with the canvas.

// each point on the board corresponds to a 10x10 pixel rect on the
// canvas. Each point's origin at relative (0,0) starts a 9x9 filled area
// and 1px wide "gap" at the right and bottom.
const bc = n => n * 10
const rect = (x, y) => {
    let [cx, cy] = [bc(x), bc(y)]
    return [cx, cy, 9, 9]
}

// turn a cell on in the given context
const paintCell = (ctx, color, cell) => {
    let [x, y] = cell
    ctx.fillStyle = color
    ctx.fillRect(...rect(x, y))
}

// clear a cell on the given context
const clearCell = (ctx, cell) => {
    console.log('clear', cell)
    let [x, y] = cell
    ctx.clearRect(...rect(x, y))
}

// update the buffer canvas with the changes
const drawState = (bctx, oldState, newState) => {
    // any cells that are in the new state and weren't in the old one
    // are "born" and should be turned on.
    newState.forEach(cell => {
        if (stateContains(oldState, cell) === false) {
            paintCell(bctx, 'green', cell)
        }
    })
    // any cells that were in the old state and are not in the new state
    // are dead. KILL THEM!!!
    oldState.forEach(cell => {
        if (stateContains(newState, cell) === false) {
            clearCell(bctx, cell)
        }
    })
}

// flip buffer (bctx) to main canvas (ctx)
const flip = (ctx, buff) => {
    ctx.drawImage(buff, 0, 0)
}


//////////////////////////////
// ACTUALLY DOING STUFF NOW //
//////////////////////////////

// and now that we have all of that out of the way,
// we can actually run the game!

// Main canvas
const canvas = document.getElementById('board')
const context = canvas.getContext('2d')

// Buffer canvas
const buffer = document.createElement('canvas')
buffer.height = canvas.height
buffer.width = canvas.width
const bcontext = buffer.getContext('2d')

// game loop

// let start
// const tick = (timestamp, board, state, context, buffer, bcontext) => {
//     if (start === undefined) {
//         start = timestamp
//     }
//     const elapsed = timestamp - start

//     let newState = update(board, state)
//     drawState(bcontext, state, newState)
//     flip(context, buffer)

//     if (elapsed <= 2000)
//     {window.requestAnimationFrame(tick(timestamp, board, state, context, buffer, bcontext))}
// }


// testing stuff that will be commented out or deleted later

const testBoard = board(50, 50)
let noState = new Set()
let testState = new Set([
    [4, 4],
    [4, 5],
    [4, 6]
])

drawState(bcontext, noState, testState)
flip(context, buffer)
let testNewState = update(testBoard, testState)
drawState(bcontext, testState, testNewState)
flip(context, buffer)

console.log(testState, testNewState)

// while (true) {
//     console.log('tick')
//     window.setTimeout(() => {
//         let newState = update(testBoard, testState)
//         drawState(bcontext, testState, newState)
//         flip(context, buffer)
//         testState = newState
//     }, 1000)
// }

// window.requestAnimationFrame(tick(0, testBoard, testState, context, buffer, bcontext))