class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    // static Cell.fromString :: String -> Cell
    static fromString(s) {
        const [x, y] = s.split(',').map(n => parseInt(n, 10))
        return new Cell(x, y)
    }

    toString() {
        return `${this.x},${this.y}`
    }

    // Cell.equals :: Cell -> Bool
    equals(other) {
        return this.x === other.x && this.y === other.y
    }
}

class State {
    constructor(grid) {
        this.grid = grid
    }

    copy() {
        return new State(this.grid)
    }
}

class Board {
    constructor(maxSizeW, maxSizeH) {
        this.w = maxSizeW
        this.h = maxSizeH
    }
}

// cellInGrid :: State -> Cell -> Bool
function cellInState (state) {
    return (cell) => {
        for (const c of state.grid) {
            if (c.x === cell.x && c.y === cell.y) {
                return True
            }
        }
        return False
    }
}

// applyDefaultRules :: Board -> State -> State
function applyDefaultRules (board) {
    return (state) => {
        newState = state.copy()
        counter = {}
        state.grid.foreach(cell => {
            let cellName = cell.toString()
            if (cellName in counter === false) {
                counter[cellName] = 0
            }
            neighbors = getCellNeighbors(board)(cell)
            neighbors.foreach(neighbor => {
                neighborName = neighbor.toString()
                if (neighborName in counter === false) {
                    counter[neighborName] = 1
                } else {
                    counter[neighborName] += 1
                }
            })
        })
        counter.keys.foreach(c => {
            currCell = Cell.fromString(c)

            let found = false
            newState.grid.foreach(cell => {
                if (cell.x === x && cell.y === y) {
                    found = true
                    break
                }
            })
            if (found) {

            }
        })
    }
}

// getCellNeighbors :: Board -> Cell -> [Cell]
function getCellNeighbors (board) {
    return (cell) => {
        let neighbors = []

        const W = cell.x - 1
        const E = cell.x + 1
        const N = cell.y - 1
        const S = cell.y + 1
        const VALID_W = W >= 0
        const VALID_E = E < board.w
        const VALID_N = N >= 0
        const VALID_S = S < board.h

        // Cell SW
        if (VALID_S && VALID_W) {
            neighbors.append(new Cell(W, S))
        }
        // Cell SE
        if (VALID_S && VALID_E) {
            neighbors.append(new Cell(E, S))
        }
        // Cell NW
        if (VALID_N && VALID_W) {
            neighbors.append(new Cell(W, N))
        }
        // Cell NE
        if (VALID_N && VALID_W) {
            neighbors.append(new Cell(E, N))
        }
        // Cell W
        if (VALID_W) {
            neighbors.append(new Cell(W, cell.y))
        }
        // Cell E
        if (VALID_E) {
            neighbors.append(new Cell(E, cell.y))
        }
        // Cell N
        if (VALID_N) {
            neighbors.append(new Cell(cell.x, N))
        }
        // Cell S
        if (VALID_S) {
            neighbors.append(new Cell(cell.x, S))
        }

        return neighbors
    }
}

// tick :: board -> rules -> state -> state
function tick (board) {
    return (rules) => (state) => {
        // pass
    }
}