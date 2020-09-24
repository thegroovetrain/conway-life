class Display {

    constructor(canvasID, boardWidth, boardHeight, background = 'white', scale = 10) {
        this.scale = scale || 10
        this.width = boardWidth * this.scale
        this.height = boardHeight * this.scale
        this.canvas = document.getElementById(canvasID)
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style = 'border: solid 1px black;'
        this.context = this.canvas.getContext('2d')
        this.buffer = document.createElement('canvas')
        this.buffer.width = this.width
        this.buffer.height = this.height
        this.bcontext = this.buffer.getContext('2d')
        this.background = (background === undefined) ? 'white' : background
    }

    clearBuffer() {
        console.log('Display.clearBuffer()')
        this.bcontext.fillStyle = 'white'
        this.bcontext.fillRect(0, 0, this.width, this.height)
        // this.bcontext.clearRect(0, 0, this.width, this.height)
    }

    drawCell(x, y, color) {
        console.log('Display.drawCell()', x, y, color)
        this.bcontext.fillStyle = color
        this.bcontext.fillRect((x * this.scale)+1, (y * this.scale)+1, 8, 8)
    }

    flip() {
        console.log('Display.flip()')
        this.context.drawImage(this.buffer, 0, 0)
    }

}

class Board {

    constructor (width, height, initialState, bounding = 'bounded') {
        this.state = new Set(initialState.map(cell => new Cell(...cell)))
        this.stateBuffer = new Set()
        this.width = width
        this.height = height
        this.bounding = bounding || 'bounded'
    }

    addCell(cell) {
        console.log('Board.addCell()', cell)
        this.stateBuffer.add(cell)
        console.log(this.stateBuffer)
    }

    clearBuffer() {
        console.log('Board.clearBuffer()')
        this.stateBuffer = new Set()
    }

    contains(givenCell) {
        console.log('Board.contains() ->', givenCell)
        for (const cell of this.state) {
            if (cell.equals(givenCell)) {
                return true
            }
        }
        return false
    }

    flip() {
        console.log('Board.flip()')
        this.state = this.stateBuffer
    }

    forEach(f) {
        console.log('Board.forEach()')
        this.state.forEach(f)
    }

}

class Simulation {

    constructor(board, display, rules) {
        console.log('Simulation.constructor()')
        this.board = board
        this.display = display
        this.rules = rules || {
            birth: new Set([3]),
            keepAlive: new Set([2,3])
        }

        this.running = false
        this.generations = 0

        this.board.forEach(cell => {
            console.log(cell)
            this.display.drawCell(...cell.value())
        })
        this.display.flip()
        console.log(this.board.state, this.board.stateBuffer)
    }

    runGeneration() {
        this.generations += 1
        console.log('generation:', this.generations)
        console.log('Simulation.runGeneration()')
        this.display.clearBuffer()
        this.board.clearBuffer()

        let counter = {}
        // count the neighbors of each relevant cell in the current generation
        console.log('*** COUNT')
        this.board.forEach(cell => {
            console.log("*", cell)
            let cellStr = cell.toString()
            console.log(cellStr)
            if (cellStr in counter === false) {
                console.log('not tracked')
                counter[cellStr] = 0
            }
            console.log(counter[cellStr])
            let neighbors = cell.getNeighbors(this.board)
            neighbors.forEach(neighbor => {
                let neighborStr = neighbor.toString()
                console.log(neighborStr)
                if (neighborStr in counter === false) {
                    console.log('not tracked')
                    counter[neighborStr] = 1
                } else {
                    console.log('tracked')
                    counter[neighborStr] += 1
                }
                console.log(counter[neighborStr])
            })
        })
        // decide whether or not a cell is alive in the current generation
        console.log('*** DECIDE')
        Object.keys(counter).forEach(cellStr => {
            let cell = Cell.fromString(cellStr)
            console.log(cellStr, counter[cellStr])
            if (this.board.contains(cell)) {
                console.log(this.rules.keepAlive, 'has', counter[cellStr])
                console.log(this.rules.keepAlive.has(counter[cellStr]))
                if (this.rules.keepAlive.has(counter[cellStr])) {
                    console.log('keepAlive', cell)
                    this.board.addCell(cell)
                    this.display.drawCell(...cell.value())
                }
            } else {
                console.log(this.rules.birth, 'has', counter[cellStr])
                console.log(this.rules.birth.has(counter[cellStr]))
                if (this.rules.birth.has(counter[cellStr])) {
                    console.log('birth', cell)
                    this.board.addCell(cell)
                    this.display.drawCell(...cell.value())
                }
            }
        })
        // flip the state and the display
        this.display.flip()
        this.board.flip()
    }

}

class Cell {

    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = (color === undefined) ? 'black' : color
    }

    static fromString(str) {
        let [x, y, color] = str.split('.')
        x = parseInt(x, 10)
        y = parseInt(y, 10)
        return new Cell(x, y, color)
    }

    equals(otherCell) {
        console.log('Cell.equals()', otherCell)
        return (this.x === otherCell.x && this.y === otherCell.y)
    }

    getNeighbors(board) {
        console.log('Cell.getNeighbors()')
        let neighbors = []
        if (board.bounding === 'bounded' || board.bounding === undefined) {
            // SW
            if (this.y + 1 < board.height && this.x - 1 >= 0) {
                neighbors.push(new Cell(this.x - 1, this.y + 1, this.color))
            }
            // SE
            if (this.y + 1 < board.height && this.x + 1 < board.width) {
                neighbors.push(new Cell(this.x + 1, this.y + 1, this.color))
            }
            // NW
            if (this.y - 1 >= 0 && this.x - 1 >= 0) {
                neighbors.push(new Cell(this.x - 1, this.y - 1, this.color))
            }
            // NE
            if (this.y - 1 >= 0 && this.x + 1 < board.width) {
                neighbors.push(new Cell(this.x + 1, this.y - 1, this.color))
            }
            // N
            if (this.y + 1 < board.height) {
                neighbors.push(new Cell(this.x, this.y + 1, this.color))
            }
            // S
            if (this.y - 1 >= 0) {
                neighbors.push(new Cell(this.x, this.y - 1, this.color))
            }
            // E
            if (this.x + 1 < board.width) {
                neighbors.push(new Cell(this.x + 1, this.y, this.color))
            }
            // W
            if (this.x - 1 >= 0) {
                neighbors.push(new Cell(this.x - 1, this.y, this.color))
            }
        }
        return neighbors
    }

    toString() {
        return `${this.x}.${this.y}.${this.color}`
    }

    value() {
        return [this.x, this.y, this.color]
    }

}

function main() {
    const board = new Board(50, 50, [[4,4], [4,5], [4,6]])
    const display = new Display('board', board.width, board.height)
    const simulation = new Simulation(board, display)

    function tick() {
        simulation.runGeneration()
        window.requestAnimationFrame(tick)
    }

    window.requestAnimationFrame(tick)
}

main()