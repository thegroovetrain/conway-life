/////////////
// DISPLAY //
/////////////

class Display {

    constructor(canvasID, boardWidth, boardHeight, background = '#FFFFFF', foreground = '#000000', border = '#000000', scale = 10) {
        this.scale = scale || 10
        this.width = boardWidth * this.scale
        this.height = boardHeight * this.scale
        this.canvas = document.getElementById(canvasID)
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style = `border: solid 1px ${border};`
        this.context = this.canvas.getContext('2d')
        this.buffer = document.createElement('canvas')
        this.buffer.width = this.width
        this.buffer.height = this.height
        this.bcontext = this.buffer.getContext('2d')
        this.background = background || '#FFFFFF'
        this.foreground = foreground || '#000000'
        this.border = border || '#000000'
    }

    clearBuffer() {
        // console.log('Display.clearBuffer()')
        this.bcontext.fillStyle = this.background
        this.bcontext.fillRect(0, 0, this.width, this.height)
        // this.bcontext.clearRect(0, 0, this.width, this.height)
    }

    drawCell(x, y) {
        // console.log('Display.drawCell()', x, y, color)
        this.bcontext.fillStyle = this.foreground
        this.bcontext.fillRect((x * this.scale)+1, (y * this.scale)+1, 8, 8)
    }

    flip() {
        // console.log('Display.flip()')
        this.context.drawImage(this.buffer, 0, 0)
    }

    enableCell(x, y) {
        console.log(`Display.enableCell(${x}, ${y})`)
        this.context.fillStyle = this.foreground
        this.context.fillRect((x * this.scale) + 1, (y * this.scale)+1, 8, 8)
    }

    disableCell(x, y) {
        console.log(`Display.disableCell(${x}, ${y})`)
        this.context.fillStyle = this.background
        this.context.fillRect(x * this.scale, y * this.scale, 10, 10)
    }

}


///////////
// BOARD //
///////////

class Board {

    constructor (width, height, initialState, edgeBehavior = 'dead') {
        this.state = new Set(initialState.map(cell => new Cell(...cell)))
        this.stateBuffer = new Set()
        this.width = width
        this.height = height
        this.edgeBehavior = edgeBehavior || 'dead'
    }

    addCell(cell) {
        // console.log('Board.addCell()', cell)
        this.stateBuffer.add(cell)
        // console.log(this.stateBuffer)
    }

    clearBuffer() {
        // console.log('Board.clearBuffer()')
        this.stateBuffer = new Set()
    }

    contains(givenCell) {
        // console.log('Board.contains() ->', givenCell)
        for (const cell of this.state) {
            if (cell.equals(givenCell)) {
                return true
            }
        }
        return false
    }

    flip() {
        // console.log('Board.flip()')
        this.state = this.stateBuffer
    }

    forEach(f) {
        // console.log('Board.forEach()')
        this.state.forEach(f)
    }

    enableCell(cell) {
        console.log(`Board.enableCell(${cell.toString()})`)
        this.state.add(cell)
    }

    disableCell(givenCell) {
        console.log(`Board.disableCell(${givenCell.toString()})`)
        for (const cell of this.state) {
            if (cell.equals(givenCell)) {
                this.state.delete(cell)
                break
            }
        }
    }

    setEdgeBehavior(behavior) {
        this.edgeBehavior = behavior
    }

}


////////////////
// SIMULATION //
////////////////

class Simulation {

    constructor(board, display, rules) {
        // console.log('Simulation.constructor()')
        this.board = board
        this.display = display
        this.rules = rules || {
            birth: new Set([3]),
            keepAlive: new Set([2,3])
        }
        this.speed = 'normal'

        this.running = false
        this.generations = 0

        // this.board.forEach(cell => {
        //     // console.log(cell)
        //     this.display.drawCell(...cell.value())
        // })
        // this.display.flip()
        // // console.log(this.board.state, this.board.stateBuffer)
    }

    runGeneration() {
        this.generations += 1
        // console.log('generation:', this.generations)
        // console.log('Simulation.runGeneration()')
        this.display.clearBuffer()
        this.board.clearBuffer()

        let counter = {}
        // count the neighbors of each relevant cell in the current generation
        // console.log('*** COUNT')
        this.board.forEach(cell => {
            // console.log("*", cell)
            let cellStr = cell.toString()
            // console.log(cellStr)
            if (cellStr in counter === false) {
                // console.log('not tracked')
                counter[cellStr] = 0
            }
            // console.log(counter[cellStr])
            let neighbors = cell.getNeighbors(this.board)
            neighbors.forEach(neighbor => {
                let neighborStr = neighbor.toString()
                // console.log(neighborStr)
                if (neighborStr in counter === false) {
                    // console.log('not tracked')
                    counter[neighborStr] = 1
                } else {
                    // console.log('tracked')
                    counter[neighborStr] += 1
                }
                // console.log(counter[neighborStr])
            })
        })
        // decide whether or not a cell is alive in the current generation
        // console.log('*** DECIDE')
        Object.keys(counter).forEach(cellStr => {
            let cell = Cell.fromString(cellStr)
            // console.log(cellStr, counter[cellStr])
            if (this.board.contains(cell)) {
                // console.log(this.rules.keepAlive, 'has', counter[cellStr])
                // console.log(this.rules.keepAlive.has(counter[cellStr]))
                if (this.rules.keepAlive.has(counter[cellStr])) {
                    // console.log('keepAlive', cell)
                    this.board.addCell(cell)
                    this.display.drawCell(...cell.value())
                }
            } else {
                // console.log(this.rules.birth, 'has', counter[cellStr])
                // console.log(this.rules.birth.has(counter[cellStr]))
                if (this.rules.birth.has(counter[cellStr])) {
                    // console.log('birth', cell)
                    this.board.addCell(cell)
                    this.display.drawCell(...cell.value())
                }
            }
        })
        // flip the state and the display
        this.display.flip()
        this.board.flip()
    }

    start() {
        this.running = true
    }

    stop() {
        this.running = false
    }

    reset() {
        this.display.clearBuffer()
        this.display.flip()
        this.board.clearBuffer()
        this.board.flip()
        this.generations = 0
    }

    addRule(rule, value) {
        this.rules[rule].add(value)
    }

    removeRule(rule, value) {
        this.rules[rule].delete(value)
    }

    setSpeed(speed) {
        this.speed = speed
    }

}


//////////
// CELL //
//////////

class Cell {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static fromString(str) {
        let [x, y] = str.split('.')
        x = parseInt(x, 10)
        y = parseInt(y, 10)
        return new Cell(x, y)
    }

    equals(otherCell) {
        // console.log('Cell.equals()', otherCell)
        return (this.x === otherCell.x && this.y === otherCell.y)
    }

    getNeighbors(board) {
        // console.log('Cell.getNeighbors()')
        let neighbors = []
        if (board.edgeBehavior === 'wrap') {
            let y1 = this.y + 1
            let y2 = this.y - 1
            let x1 = this.x + 1
            let x2 = this.x - 1
            y1 = y1 >= board.height ? 0 : y1
            y2 = y2 < 0 ? board.height-1 : y2
            x1 = x1 >= board.width ? 0 : x1
            x2 = x2 < 0 ? board.width-1 : x2
            neighbors.push(new Cell(x1, y1))
            neighbors.push(new Cell(x1, y2))
            neighbors.push(new Cell(x2, y1))
            neighbors.push(new Cell(x2, y2))
            neighbors.push(new Cell(x1, this.y))
            neighbors.push(new Cell(x2, this.y))
            neighbors.push(new Cell(this.x, y1))
            neighbors.push(new Cell(this.x, y2))
        } else {       // dead
            // SW
            if (this.y + 1 < board.height && this.x - 1 >= 0) {
                neighbors.push(new Cell(this.x - 1, this.y + 1))
            }
            // SE
            if (this.y + 1 < board.height && this.x + 1 < board.width) {
                neighbors.push(new Cell(this.x + 1, this.y + 1))
            }
            // NW
            if (this.y - 1 >= 0 && this.x - 1 >= 0) {
                neighbors.push(new Cell(this.x - 1, this.y - 1))
            }
            // NE
            if (this.y - 1 >= 0 && this.x + 1 < board.width) {
                neighbors.push(new Cell(this.x + 1, this.y - 1))
            }
            // N
            if (this.y + 1 < board.height) {
                neighbors.push(new Cell(this.x, this.y + 1))
            }
            // S
            if (this.y - 1 >= 0) {
                neighbors.push(new Cell(this.x, this.y - 1))
            }
            // E
            if (this.x + 1 < board.width) {
                neighbors.push(new Cell(this.x + 1, this.y))
            }
            // W
            if (this.x - 1 >= 0) {
                neighbors.push(new Cell(this.x - 1, this.y))
            }
        }
        return neighbors
    }

    toString() {
        return `${this.x}.${this.y}}`
    }

    value() {
        return [this.x, this.y]
    }

}


///////////////////////////
// HEY LETS DO STUFF NOW //
///////////////////////////

const board = new Board(50, 50, [])
const display = new Display('board', board.width, board.height, "#625fec","#ff58e3")
const simulation = new Simulation(board, display)

// Game Loop
let ticks = 0
function tick() {
    // throttle speed
    if (
        (simulation.speed === 'fastest') ||
        (simulation.speed === 'faster' && ticks % 2 === 0) ||
        (simulation.speed === 'normal' && ticks % 4 === 0) ||
        (simulation.speed === 'slower' && ticks % 8 === 0) ||
        (simulation.speed === 'slowest' && ticks % 16 === 0) ||
        (simulation.running === false)
    ) {
        simulation.runGeneration()
        ticks = 0
        generationsDisplayField.innerText = `Generations: ${simulation.generations}`
    }

    ticks ++

    // request a new frame only if the simulation is running
    if (simulation.running) {
        window.requestAnimationFrame(tick)
    }
}


///////////////////
// PAGE CONTROLS //
///////////////////
// oh dear sweet satan, forgive thee these nasty awful side effects
// amit these befuddling passages wrought of ill-formed spaghetti
// but 'tis a controlled environment and but nil could go awry
// alas, efficiency is my patron god ⛧

const generationsDisplayField = document.getElementById('gens')

// START/STOP, STEP and RESET buttons
const runButton = document.getElementById('run')
const stepButton = document.getElementById('step')
const resetButton = document.getElementById('reset')

// EDGE BEHAVIOR
const edgeBehaviorFieldset = document.getElementById('edgeBehavior')
let behaviors = ['dead', 'wrap']
for (behavior of behaviors) {
    let label = document.createElement('label')
    let radio = document.createElement('input')
    radio.setAttribute('type', 'radio')
    radio.setAttribute('id', behavior)
    radio.setAttribute('name', 'behavior')
    radio.setAttribute('value', behavior)
    if(behavior === board.edgeBehavior) {
        radio.setAttribute('checked', true)
    }
    radio.addEventListener('click', event => {
        board.setEdgeBehavior(event.target.value)
    })
    label.appendChild(radio)
    label.append(behavior.charAt(0).toUpperCase() + behavior.slice(1))
    edgeBehaviorFieldset.appendChild(label)
}

// SIMULATION SPEED
const speedFieldset = document.getElementById('speed')
let speeds = ['slowest', 'slower', 'normal', 'faster', 'fastest']
for (speed of speeds) {
    let label = document.createElement('label')
    let radio = document.createElement('input')
    radio.setAttribute('type', 'radio')
    radio.setAttribute('id', speed)
    radio.setAttribute('name', 'speed')
    radio.setAttribute('value', speed)
    if(speed === simulation.speed) {
        radio.setAttribute('checked', true)
    }
    radio.addEventListener('click', event => {
        simulation.setSpeed(event.target.value)
    })
    label.appendChild(radio)
    label.append(speed.charAt(0).toUpperCase() + speed.slice(1))
    speedFieldset.appendChild(label)
}

// RULES FOR BIRTH AND KEEPALIVE
const rulesFieldSet = document.getElementById('rules')
const rulesTable = document.createElement('table')
const rulesHeaderRow = document.createElement('tr')
const rulesHeader = document.createElement('td')
rulesHeader.innerText = "For each generation..."
rulesHeaderRow.appendChild(rulesHeader)
for(let i = 0; i <= 8; i++) {
    let th = document.createElement('th')
    th.innerText = `${i}`
    rulesHeaderRow.appendChild(th)
}
rulesTable.appendChild(rulesHeaderRow)

const rulesBirthRow = document.createElement('tr')
const rulesBirthTaglines = [
    '...new cells with exactly',
    'neighbors are born anew.'
]
const rulesBirthTaglineFore = document.createElement('td')
rulesBirthTaglineFore.innerText = rulesBirthTaglines[0]
rulesBirthRow.appendChild(rulesBirthTaglineFore)
for(let i = 0; i <= 8; i++) {
    let td = document.createElement('td')
    let input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.setAttribute('id', `birth${i}`)
    input.setAttribute('name', `birth${i}`)
    input.setAttribute('value', `${i}`)
    if(simulation.rules.birth.has(i)) {
        input.setAttribute('checked', true)
    }
    input.addEventListener('click', event => {
        if(event.target.checked) {
            simulation.addRule('birth', i)
            console.log(simulation.rules.birth)
        } else {
            simulation.removeRule('birth', i)
            console.log(simulation.rules.birth)
        }
    })
    td.appendChild(input)
    rulesBirthRow.appendChild(td)
}
const rulesBirthTaglineAft = document.createElement('td')
rulesBirthTaglineAft.innerText = rulesBirthTaglines[1]
rulesBirthRow.appendChild(rulesBirthTaglineAft)
rulesTable.appendChild(rulesBirthRow)

const rulesDeathRow = document.createElement('tr')
const rulesDeathTaglines = [
    '...living cells with exactly',
    'neighbors remain alive.'
]
const rulesDeathTaglineFore = document.createElement('td')
rulesDeathTaglineFore.innerText = rulesDeathTaglines[0]
rulesDeathRow.appendChild(rulesDeathTaglineFore)
for(let i = 0; i <= 8; i++) {
    let td = document.createElement('td')
    let input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.setAttribute('id', `death${i}`)
    input.setAttribute('name', `death${i}`)
    input.setAttribute('value', `${i}`)
    if(simulation.rules.keepAlive.has(i)) {
        input.setAttribute('checked', true)
    }
    input.addEventListener('click', event => {
        if(event.target.checked) {
            simulation.addRule('keepAlive', i)
            console.log(simulation.rules.keepAlive)
        } else {
            simulation.removeRule('keepAlive', i)
            console.log(simulation.rules.keepAlive)
        }
    })
    td.appendChild(input)
    rulesDeathRow.appendChild(td)
}
const rulesDeathTaglineAft = document.createElement('td')
rulesDeathTaglineAft.innerText = rulesDeathTaglines[1]
rulesDeathRow.appendChild(rulesDeathTaglineAft)
rulesTable.appendChild(rulesDeathRow)

rulesFieldSet.appendChild(rulesTable)

// RUN/PAUSE, STEP AND RESET FUNCTIONS
function run(event) {
    event.preventDefault()
    if (simulation.running) {
        simulation.stop()
        runButton.innerText = "Run"
        stepButton.disabled = false
        resetButton.disabled = false
        denseButton.disabled = false
        moderateButton.disabled = false
        sparseButton.disabled = false
    } else {
        simulation.start()
        window.requestAnimationFrame(tick)
        runButton.innerText = "Pause"
        stepButton.disabled = true
        resetButton.disabled = true
        denseButton.disabled = true
        moderateButton.disabled = true
        sparseButton.disabled = true
    }
}

function step(event) {
    event.preventDefault()
    if (simulation.running === false) {
        window.requestAnimationFrame(tick)
    }
}

function reset(event) {
    event.preventDefault()
    if (simulation.running === false) {
        simulation.reset()
    }
    generationsDisplayField.innerText = 'Generations: 0'
}

runButton.addEventListener("click", run)
stepButton.addEventListener("click", step)
resetButton.addEventListener("click", reset)

// ADD/REMOVE CELLS BETWEEN RUNS
function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

display.canvas.addEventListener("click", event => {
    event.preventDefault()
    if(simulation.running === false) {
        let mousePos = getMousePos(display.canvas, event)
        let f = n => Math.floor(n / display.scale)
        let x = f(mousePos.x)
        let y = f(mousePos.y)
        let cell = new Cell(x, y)
        console.log(board.contains(cell))
        if (board.contains(cell)) {
            display.disableCell(x, y)
            board.disableCell(cell)
        } else {
            display.enableCell(x, y, cell.color)
            board.enableCell(cell)
        }
    }
})

// RESET AND RANDOMIZE CELLS
const randomizeFieldset = document.getElementById('random')

const denseButton = document.createElement('button')
denseButton.innerText = 'Dense'
denseButton.addEventListener('click', event => {
    event.preventDefault()
    if(simulation.running === false) {
        reset(event)
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                let roll = Math.floor(Math.random() * 2)
                if (roll === 0) {
                    let cell = new Cell(x, y)
                    display.enableCell(x, y, cell.color)
                    board.enableCell(cell)
                }
            }
        }
    }
})
randomizeFieldset.appendChild(denseButton)

const moderateButton = document.createElement('button')
moderateButton.innerText = 'Moderate'
moderateButton.addEventListener('click', event => {
    event.preventDefault()
    if(simulation.running === false) {
        reset(event)
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                let roll = Math.floor(Math.random() * 4)
                if (roll === 0) {
                    let cell = new Cell(x, y)
                    display.enableCell(x, y, cell.color)
                    board.enableCell(cell)
                }
            }
        }
    }
})
randomizeFieldset.appendChild(moderateButton)

const sparseButton = document.createElement('button')
sparseButton.innerText = 'Sparse'
sparseButton.addEventListener('click', event => {
    event.preventDefault()
    if(simulation.running === false) {
        reset(event)
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                let roll = Math.floor(Math.random() * 8)
                if (roll === 0) {
                    let cell = new Cell(x, y)
                    display.enableCell(x, y, cell.color)
                    board.enableCell(cell)
                }
            }
        }
    }
})
randomizeFieldset.appendChild(sparseButton)

// COLORS
const colorFieldset = document.getElementById('colors')

const backgroundColorLabel = document.createElement('label')
const backgroundColorInput = document.createElement('input')
backgroundColorInput.setAttribute('type', 'color')
backgroundColorInput.setAttribute('id', 'backgroundColor')
backgroundColorInput.setAttribute('value', display.background)
backgroundColorInput.addEventListener('change', event => {
    display.background = event.target.value
})
backgroundColorLabel.appendChild(backgroundColorInput)
backgroundColorLabel.prepend('Background: ')
colorFieldset.appendChild(backgroundColorLabel)
colorFieldset.appendChild(document.createElement('br'))

const foregroundColorLabel = document.createElement('label')
const foregroundColorInput = document.createElement('input')
foregroundColorInput.setAttribute('type', 'color')
foregroundColorInput.setAttribute('id', 'foregroundColor')
foregroundColorInput.setAttribute('value', display.foreground)
foregroundColorInput.addEventListener('change', event => {
    display.foreground = event.target.value
})
foregroundColorLabel.appendChild(foregroundColorInput)
foregroundColorLabel.prepend('Foreground: ')
colorFieldset.appendChild(foregroundColorLabel)
colorFieldset.appendChild(document.createElement('br'))

const randomColorsButton = document.createElement('button')
randomColorsButton.innerText = "Randomize Colors"
randomColorsButton.addEventListener('click', event => {
    event.preventDefault()
    let newBackground = randomColor()
    let newForeground = randomColor()
    backgroundColorInput.value = newBackground
    display.background = newBackground
    foregroundColorInput.value = newForeground
    display.foreground = newForeground
})

function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

colorFieldset.appendChild(randomColorsButton)

simulation.reset()