import { createSlice, configureStore } from '@reduxjs/toolkit';

const initialState = {
    fields: [],
    ships: [],
    nextPlayer: 1,
    availableMoves: [[], []],
    nextPossibleMoves: [[], []],
    prevSuccessfullMoves: [[], []],
    nextMove: [null, null],
}

initialState.fields.push([]);
initialState.fields.push([]);

initialState.ships.push([]);
initialState.ships.push([]);

for (let i = 0; i < 10; i++) {
    initialState.fields[0].push([]);
    initialState.fields[1].push([]);
    for (let j = 0; j < 10; j++) {
        initialState.fields[0][i].push({ type: ' ', x: i, y: j });
        initialState.fields[1][i].push({ type: ' ', x: i, y: j });
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

placeShip(initialState.fields[0], 4, initialState.ships[0]);

placeShip(initialState.fields[0], 3, initialState.ships[0]);
placeShip(initialState.fields[0], 3, initialState.ships[0]);

placeShip(initialState.fields[0], 2, initialState.ships[0]);
placeShip(initialState.fields[0], 2, initialState.ships[0]);
placeShip(initialState.fields[0], 2, initialState.ships[0]);

placeShip(initialState.fields[0], 1, initialState.ships[0]);
placeShip(initialState.fields[0], 1, initialState.ships[0]);
placeShip(initialState.fields[0], 1, initialState.ships[0]);
placeShip(initialState.fields[0], 1, initialState.ships[0]);


placeShip(initialState.fields[1], 4, initialState.ships[1]);

placeShip(initialState.fields[1], 3, initialState.ships[1]);
placeShip(initialState.fields[1], 3, initialState.ships[1]);

placeShip(initialState.fields[1], 2, initialState.ships[1]);
placeShip(initialState.fields[1], 2, initialState.ships[1]);
placeShip(initialState.fields[1], 2, initialState.ships[1]);

placeShip(initialState.fields[1], 1, initialState.ships[1]);
placeShip(initialState.fields[1], 1, initialState.ships[1]);
placeShip(initialState.fields[1], 1, initialState.ships[1]);
placeShip(initialState.fields[1], 1, initialState.ships[1]);

function genBotMoves(moves) {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            moves.push({ x: i, y: j });
        }
    }
}

genBotMoves(initialState.availableMoves[0]);
genBotMoves(initialState.availableMoves[1]);

function cellSelectedFn(state, action) {
    let { x, y, fieldIndex } = action.payload;

    if (state.availableMoves[fieldIndex].findIndex(item => item.x === x && item.y === y) === -1) return;

    let field = state.fields[fieldIndex];
    let cell = field[x][y];

    let shipIndex = cell.type === 'O' ? cell.index : -1;

    if (cell.type === 'O') {
        let shipLength = state.ships[fieldIndex][shipIndex].length - 1

        state.ships[fieldIndex][shipIndex].length = shipLength;
        state.ships[fieldIndex][shipIndex].ship[shipLength].type = 'K';
    }

    state.nextPlayer = cell.type === 'O' ? fieldIndex : (fieldIndex + 1) % 2;

    cell.type = cell.type === 'O' ? 'K' : 'X';
}

function updateAvailableMovesFn(state, action) {
    let { fieldIndex } = action.payload;

    let field = state.fields[fieldIndex];

    let availableMoves = [];

    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].type === ' ' || field[i][j].type === 'O') {
                availableMoves.push({ x: i, y: j });
            }
        }
    }

    state.availableMoves[fieldIndex] = availableMoves;
}

function drawBorderFn(state, action) {
    let { fieldIndex } = action.payload;
    let field = state.fields[fieldIndex];
    let ships = state.ships[fieldIndex];
    let availableMoves = state.availableMoves[fieldIndex];
    let border = [];

    for (let i = 0; i < ships.length; i++) {
        if (ships[i].length === 0)
            for (let j = 0; j < ships[i].border.length; j++) {
                let availableMoveIndex = availableMoves.findIndex(item => item.x === ships[i].border[j].x && item.y === ships[i].border[j].y);
                if (availableMoveIndex !== -1) {
                    border.push({ x: ships[i].border[j].x, y: ships[i].border[j].y, type: 'B' });
                }
            }
    }

    if (border.length > 1) {
        for (let i = 0; i < border.length; i++) {
            let cell = border[i];
            field[cell.x][cell.y].type = 'B';
        }

        state.prevSuccessfullMoves[fieldIndex] = [];
    }
}

function generateNextMovesFn(state, action) {
    let { x, y, fieldIndex } = action.payload;
    let field = state.fields[fieldIndex];

    if (field[x][y].type === 'K') {
        let nextPossibleMoves = [0];
        let prevSuccessfullMoves = [];
        for (let i = 0; i < state.prevSuccessfullMoves[fieldIndex].length; i++) {
            let item = state.prevSuccessfullMoves[fieldIndex][i];
            prevSuccessfullMoves.push({ x: item.x, y: item.y });
        }

        for (let i = 0; i < state.nextPossibleMoves[fieldIndex].length; i++) {
            nextPossibleMoves.push(state.nextPossibleMoves[fieldIndex][i]);
        }

        nextPossibleMoves.push({ x: x - 1, y: y });

        nextPossibleMoves.push({ x: x, y: y + 1 });

        nextPossibleMoves.push({ x: x + 1, y: y });

        nextPossibleMoves.push({ x: x, y: y - 1 });

        let availableMoves = state.availableMoves[fieldIndex];
        for (let i = 0; i < nextPossibleMoves.length; i++) {
            let nextPossibleMove = nextPossibleMoves[i];
            if (availableMoves.findIndex(item => item.x === nextPossibleMove.x && item.y === nextPossibleMove.y) === -1) {
                nextPossibleMoves.splice(i, 1);
                i--;
            }
        }

        prevSuccessfullMoves.push({ x, y });

        if (prevSuccessfullMoves.length > 1) {
            let prevSuccessfullMove = prevSuccessfullMoves[prevSuccessfullMoves.length - 1];
            let prevPrevSuccessfullMove = prevSuccessfullMoves[prevSuccessfullMoves.length - 2];

            if ((Math.abs(prevPrevSuccessfullMove.x - prevSuccessfullMove.x) === 0 && Math.abs(prevPrevSuccessfullMove.y - prevSuccessfullMove.y) === 1) ||
                (Math.abs(prevPrevSuccessfullMove.x - prevSuccessfullMove.x) === 1 && Math.abs(prevPrevSuccessfullMove.y - prevSuccessfullMove.y) === 0)) {

                if (prevPrevSuccessfullMove.x === prevSuccessfullMove.x) {
                    for (let i = 0; i < nextPossibleMoves.length; i++) {
                        if (nextPossibleMoves[i].x !== prevPrevSuccessfullMove.x) {
                            nextPossibleMoves.splice(i, 1);
                            i--;
                        }
                    }
                } else {
                    for (let i = 0; i < nextPossibleMoves.length; i++) {
                        if (nextPossibleMoves[i].y !== prevPrevSuccessfullMove.y) {
                            nextPossibleMoves.splice(i, 1);
                            i--;
                        }
                    }
                }

            }
        }

        state.nextPossibleMoves[fieldIndex] = nextPossibleMoves;

        state.prevSuccessfullMoves[fieldIndex] = prevSuccessfullMoves;
    }
}

function generateNextMoveFn(state, action) {
    let { fieldIndex } = action.payload;
    let availableMoves = state.availableMoves[fieldIndex]
    let nextPossibleMoves = state.nextPossibleMoves[fieldIndex]
    let next = Math.floor(Math.random() * availableMoves.length);

    let move = availableMoves[next];

    if (nextPossibleMoves.length > 0) {
        move = nextPossibleMoves[Math.floor(Math.random() * nextPossibleMoves.length)];
    }

    state.nextMove[fieldIndex] = move
}

function updateNextMovesFn(state, action) {
    let { x, y, fieldIndex } = action.payload;
    let nextPossibleMoves = state.nextPossibleMoves[fieldIndex];
    let nextPossibleMoveIndex = nextPossibleMoves.findIndex(item => item.x === x && item.y === y);
    nextPossibleMoves.splice(nextPossibleMoveIndex, 1);
    state.nextPossibleMoves[fieldIndex] = nextPossibleMoves;
}

generateNextMoveFn(initialState, { payload: { fieldIndex: 0 } });
generateNextMoveFn(initialState, { payload: { fieldIndex: 1 } });

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        cellSelected(state, action) {
            let { fieldIndex } = action.payload;

            if (state.nextPlayer === fieldIndex) {
                cellSelectedFn(state, action);
                updateNextMovesFn(state, action)
                drawBorderFn(state, action)
                updateAvailableMovesFn(state, action)
                generateNextMovesFn(state, action);
                generateNextMoveFn(state, action)
            }
        }
    },
})

export const { drawBorder, cellSelected } = gameSlice.actions

export default configureStore({
    reducer: {
        game: gameSlice.reducer
    },
})