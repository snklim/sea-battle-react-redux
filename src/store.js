import { createSlice, configureStore, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    fields: [[], []],
    nextPlayer: 1,
    nextMove: [null, null],
    prevMove: [{ x: -1, y: -1 }, { x: -1, y: -1 }],
    availableShips: [10, 10],
    status: -2
}

export const start = createAsyncThunk('game/start', async () => {
    let response = await window.fetch("/api/game")

    let data = await response.json()

    return data
})

export const move = createAsyncThunk('game/move', async ({ x, y, fieldIndex }) => {

    let response = await window.fetch("/api/game", { method: 'POST', body: JSON.stringify({ x, y, fieldIndex }) })

    let data = await response.json()

    return data
})

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
    },
    extraReducers: {
        [start.fulfilled]: (state, action) => {

            let { nextMove, fields } = action.payload;

            state.fields = [[], []];
            state.nextPlayer = 1;
            state.nextMove = [null, null];
            state.prevMove = [{ x: -1, y: -1 }, { x: -1, y: -1 }];
            state.availableShips = [10, 10];

            state.status = -1;

            state.nextMove[0] = nextMove[0];
            state.nextMove[1] = nextMove[1];

            for (let fieldIndex = 0; fieldIndex < 2; fieldIndex++) {
                for (let i = 0; i < 10; i++) {
                    state.fields[fieldIndex].push([])

                    for (let j = 0; j < 10; j++) {
                        let { x, y, type } = fields[fieldIndex][i][j];
                        state.fields[fieldIndex][i].push({ x, y, type });
                    }
                }
            }
        },
        [move.fulfilled]: (state, action) => {
            let { valid, x, y, cells, fieldIndex, nextPlayer, nextMove, status } = action.payload

            if (valid) {
                for (let i = 0; i < cells.length; i++) {
                    let cell = cells[i]
                    state.fields[fieldIndex][cell.x][cell.y].type = cell.type
                }

                state.nextPlayer = nextPlayer
                state.nextMove[fieldIndex] = nextMove
                state.prevMove[fieldIndex] = { x, y }
                state.status = status
            }
        }
    }
})

export default configureStore({
    reducer: {
        game: gameSlice.reducer
    },
})