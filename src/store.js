import { createSlice, configureStore } from '@reduxjs/toolkit';


let availableMoves = [[], []];
let nextPossibleMoves = [[], []];
let prevSuccessfullMoves = [[], []];
let fields = [[], []];
let ships = [[], []];

const initialState = {
    fields: [[], []],
    nextPlayer: 1,
    nextMove: [null, null],
}

for (let i = 0; i < 10; i++) {
    fields[0].push([]);
    fields[1].push([]);
    for (let j = 0; j < 10; j++) {
        fields[0][i].push({ type: ' ', x: i, y: j });
        fields[1][i].push({ type: ' ', x: i, y: j });
    }
}

function placeShip(field, length, ships) {

    let max = 10;
    let attempts = 100;
    let placed = false;

    while (0 < attempts--) {
        let x = Math.round(Math.random() * 9);
        let y = Math.round(Math.random() * 9);

        let direction = Math.round(Math.random());
        let border = [];
        let ship = [];

        if (direction === 0) {

            if (x + length > max)
                x -= x + length - max;

            for (let k = -1; k < 2; k++)
                for (let i = -1; i < length + 1; i++)
                    if (x + i < max && y + k < max && y + k >= 0 && x + i >= 0)
                        if ((i >= 0 && i < length && k !== 0) || i < 0 || i >= length)
                            border.push({ x: x + i, y: y + k })

            for (let i = 0; i < length; i++)
                ship.push({ x: x + i, y: y, type: 'O' })
        }
        else {

            if (y + length > max)
                y -= y + length - max

            for (let k = -1; k < 2; k++)
                for (let i = -1; i < length + 1; i++)
                    if (y + i < max && x + k < max && x + k >= 0 && y + i >= 0)
                        if ((i >= 0 && i < length && k !== 0) || i < 0 || i === length)
                            border.push({ x: x + k, y: y + i })

            for (let i = 0; i < length; i++)
                ship.push({ x: x, y: y + i, type: 'O' })
        }

        let canPlace = true;

        for (let i = 0; i < ship.length; i++) {
            let cell = ship[i];
            if (field[cell.x][cell.y].type === 'O') {
                canPlace = false;
                break;
            }
        }

        for (let i = 0; i < border.length; i++) {
            let cell = border[i];
            if (field[cell.x][cell.y].type === 'O') {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            for (let i = 0; i < border.length; i++) {
                let cell = border[i];
                field[cell.x][cell.y] = { type: ' ', x: cell.x, y: cell.y };
            }

            for (let i = 0; i < ship.length; i++) {
                let cell = ship[i];
                field[cell.x][cell.y] = { type: 'O', x: cell.x, y: cell.y, index: ships.length };
            }

            ships.push({
                index: ships.length, ship, border, length
            });

            placed = true;

            break;
        }
    }

    if (!placed)
        console.warn("Ship was not placed", length);
}

placeShip(fields[0], 4, ships[0]);

placeShip(fields[0], 3, ships[0]);
placeShip(fields[0], 3, ships[0]);

placeShip(fields[0], 2, ships[0]);
placeShip(fields[0], 2, ships[0]);
placeShip(fields[0], 2, ships[0]);

placeShip(fields[0], 1, ships[0]);
placeShip(fields[0], 1, ships[0]);
placeShip(fields[0], 1, ships[0]);
placeShip(fields[0], 1, ships[0]);


placeShip(fields[1], 4, ships[1]);

placeShip(fields[1], 3, ships[1]);
placeShip(fields[1], 3, ships[1]);

placeShip(fields[1], 2, ships[1]);
placeShip(fields[1], 2, ships[1]);
placeShip(fields[1], 2, ships[1]);

placeShip(fields[1], 1, ships[1]);
placeShip(fields[1], 1, ships[1]);
placeShip(fields[1], 1, ships[1]);
placeShip(fields[1], 1, ships[1]);

function genBotMoves(moves) {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            moves.push({ x: i, y: j });
        }
    }
}

genBotMoves(availableMoves[0]);
genBotMoves(availableMoves[1]);

function shotFn({ x, y, fieldIndex, cells }) {

    if (availableMoves[fieldIndex].findIndex(item => item.x === x && item.y === y) === -1) return;

    let field = fields[fieldIndex];
    let cell = field[x][y];

    let shipIndex = cell.type === 'O' ? cell.index : -1;

    if (cell.type === 'O') {
        let shipLength = ships[fieldIndex][shipIndex].length - 1

        ships[fieldIndex][shipIndex].length = shipLength;
        ships[fieldIndex][shipIndex].ship[shipLength].type = 'K';
    }

    cell.type = cell.type === 'O' ? 'K' : 'X';

    cells.push(cell)

    return cell.type === 'O' ? fieldIndex : (fieldIndex + 1) % 2;
}

function updateAvailableMovesFn({ fieldIndex }) {
    let field = fields[fieldIndex];

    availableMoves[fieldIndex] = [];

    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].type === ' ' || field[i][j].type === 'O') {
                availableMoves[fieldIndex].push({ x: i, y: j });
            }
        }
    }
}

function drawBorderFn({ fieldIndex, cells }) {
    let field = fields[fieldIndex];
    let border = [];

    for (let i = 0; i < ships[fieldIndex].length; i++) {
        if (ships[fieldIndex][i].length === 0)
            for (let j = 0; j < ships[fieldIndex][i].border.length; j++) {
                let availableMoveIndex = availableMoves[fieldIndex].findIndex(item => item.x === ships[fieldIndex][i].border[j].x && item.y === ships[fieldIndex][i].border[j].y);
                if (availableMoveIndex !== -1) {
                    border.push({ x: ships[fieldIndex][i].border[j].x, y: ships[fieldIndex][i].border[j].y, type: 'B' });
                }
            }
    }

    if (border.length > 1) {
        for (let i = 0; i < border.length; i++) {
            let cell = border[i];
            field[cell.x][cell.y].type = 'B';

            cells.push(cell)
        }

        prevSuccessfullMoves[fieldIndex] = [];
    }
}

function generateNextMovesFn({ x, y, fieldIndex }) {
    let field = fields[fieldIndex];

    if (field[x][y].type === 'K') {

        nextPossibleMoves[fieldIndex].push({ x: x - 1, y: y });

        nextPossibleMoves[fieldIndex].push({ x: x, y: y + 1 });

        nextPossibleMoves[fieldIndex].push({ x: x + 1, y: y });

        nextPossibleMoves[fieldIndex].push({ x: x, y: y - 1 });

        for (let i = 0; i < nextPossibleMoves[fieldIndex].length; i++) {
            let nextPossibleMove = nextPossibleMoves[fieldIndex][i];
            if (availableMoves[fieldIndex].findIndex(item => item.x === nextPossibleMove.x && item.y === nextPossibleMove.y) === -1) {
                nextPossibleMoves[fieldIndex].splice(i, 1);
                i--;
            }
        }

        prevSuccessfullMoves[fieldIndex].push({ x, y });

        if (prevSuccessfullMoves[fieldIndex].length > 1) {
            let prevSuccessfullMove = prevSuccessfullMoves[fieldIndex][prevSuccessfullMoves[fieldIndex].length - 1];
            let prevPrevSuccessfullMove = prevSuccessfullMoves[fieldIndex][prevSuccessfullMoves[fieldIndex].length - 2];

            if ((Math.abs(prevPrevSuccessfullMove.x - prevSuccessfullMove.x) === 0 && Math.abs(prevPrevSuccessfullMove.y - prevSuccessfullMove.y) === 1) ||
                (Math.abs(prevPrevSuccessfullMove.x - prevSuccessfullMove.x) === 1 && Math.abs(prevPrevSuccessfullMove.y - prevSuccessfullMove.y) === 0)) {

                if (prevPrevSuccessfullMove.x === prevSuccessfullMove.x) {
                    for (let i = 0; i < nextPossibleMoves[fieldIndex].length; i++) {
                        if (nextPossibleMoves[fieldIndex][i].x !== prevPrevSuccessfullMove.x) {
                            nextPossibleMoves[fieldIndex].splice(i, 1);
                            i--;
                        }
                    }
                } else {
                    for (let i = 0; i < nextPossibleMoves[fieldIndex].length; i++) {
                        if (nextPossibleMoves[fieldIndex][i].y !== prevPrevSuccessfullMove.y) {
                            nextPossibleMoves[fieldIndex].splice(i, 1);
                            i--;
                        }
                    }
                }

            }
        }
    }
}

function generateNextMoveFn({ fieldIndex }) {
    let next = Math.floor(Math.random() * availableMoves[fieldIndex].length);

    let move = availableMoves[fieldIndex][next];

    if (nextPossibleMoves[fieldIndex].length > 0) {
        move = nextPossibleMoves[fieldIndex][Math.floor(Math.random() * nextPossibleMoves[fieldIndex].length)];
    }

    return move
}

function updateNextMovesFn({ x, y, fieldIndex }) {
    let nextPossibleMoveIndex = nextPossibleMoves[fieldIndex].findIndex(item => item.x === x && item.y === y);
    nextPossibleMoves[fieldIndex].splice(nextPossibleMoveIndex, 1);
}

initialState.nextMove[0] = generateNextMoveFn({ fieldIndex: 0 });
initialState.nextMove[1] = generateNextMoveFn({ fieldIndex: 1 });

for (let fieldIndex = 0; fieldIndex < 2; fieldIndex++) {
    for (let i = 0; i < 10; i++) {
        initialState.fields[fieldIndex].push([])

        for (let j = 0; j < 10; j++) {
            let { x, y, type } = fields[fieldIndex][i][j];
            initialState.fields[fieldIndex][i].push({ x, y, type });
        }
    }
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        shot(state, action) {
            let { fieldIndex } = action.payload;

            if (state.nextPlayer === fieldIndex) {

                let changes = {
                    cells: [],
                };

                state.nextPlayer = shotFn({ ...action.payload, ...changes });
                updateNextMovesFn(action.payload)
                drawBorderFn({ ...action.payload, ...changes })
                updateAvailableMovesFn(action.payload)
                generateNextMovesFn(action.payload);
                state.nextMove[fieldIndex] = generateNextMoveFn(action.payload)

                for (let i = 0; i < changes.cells.length; i++) {
                    let cell = changes.cells[i]
                    state.fields[fieldIndex][cell.x][cell.y].type = cell.type
                }
            }
        }
    },
})

export const { drawBorder, shot } = gameSlice.actions

export default configureStore({
    reducer: {
        game: gameSlice.reducer
    },
})