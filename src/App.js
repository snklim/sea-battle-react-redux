import './App.css';
import classNames from 'classnames';
import { useEffect, useState, Fragment } from 'react';
import { useSelector, useDispatch, } from 'react-redux';
import { start, start1, move, move1, sendMessage } from './store';

function Cell({ row, column, index }) {
  let field = useSelector(state => state.game.fields[index]);
  let nextPlayer = useSelector(state => state.game.nextPlayer);
  let player = useSelector(state => state.game.player);
  let name = useSelector(state => state.game.name);
  let prevMove = useSelector(state => state.game.prevMove[index]);
  let cell = field[row][column];

  let className = classNames('cell', 'cell-index-' + row + '-' + column, {
    'cell-ship': index === 0 && cell.type === 'O',
    'cell-border': cell.type === 'B',
    'cell-missed': cell.type === 'X',
    'cell-injured': cell.type === 'I',
    'cell-killed': cell.type === 'K',
    'cell-next-move': row === prevMove.x && column === prevMove.y && cell.type !== 'K',
  });

  let dispatch = useDispatch();

  return (
    <div className={className} onClick={() => {
      if (nextPlayer === player && index === 1) {
        dispatch(move1({ x: cell.x, y: cell.y, player: player, name: name }));
      }
    }}></div>
  );
}

function Bot() {
  let nextMove = useSelector(state => state.game.nextMove[0]);
  let nextPlayer = useSelector(state => state.game.nextPlayer);
  let dispatch = useDispatch();

  useEffect(() => {
    let interval = setInterval(() => {
      if (!!nextMove && nextPlayer === 0) {
        dispatch(move1({ x: nextMove.x, y: nextMove.y, fieldIndex: 0 }));
        // dispatch(sendMessage({ user: 'mrx', message: new Date().toISOString() }));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [dispatch, nextMove, nextPlayer]);

  return (<Fragment></Fragment>);
}

function Row({ index, children }) {
  let className = classNames('row', 'row-index-' + index);

  return (
    <div className={className}>{children}</div>
  );
}

function Info() {
  let nextPlayer = useSelector(state => state.game.nextPlayer);
  let player = useSelector(state => state.game.player);
  let status = useSelector(state => state.game.status);

  return (
    <Fragment>
      {status === -1 && nextPlayer === player && <Row><span>Your turn</span></Row>}
      {status === -1 && nextPlayer !== player && <Row><span>Opponent turn</span></Row>}
      {status === 0 && (<span>You lose</span>)}
      {status === 1 && (<span>You win</span>)}
    </Fragment>
  );
}

function Field({ index }) {
  let rows = [];

  let className = classNames('field', {
    'field-self': index === 0,
    'field-enemy': index === 1,
  });

  for (let i = 0; i < 10; i++) {
    let cells = [];
    for (let j = 0; j < 10; j++) {
      cells.push(<Cell key={i * 10 + j} row={i} column={j} index={index}></Cell>);
    }
    rows.push(<Row key={i} index={i}>{cells}</Row>);
  }

  return (
    <div className={className}>
      {rows}
    </div>
  );
}

function Game() {
  return (
    <Fragment>
      <Row>
        <Info></Info>
      </Row>
      <Field index={0}></Field>
      <Field index={1}></Field>
      {/* <Bot></Bot> */}
    </Fragment>
  );
}

function App() {
  let dispatch = useDispatch();
  let status = useSelector(state => state.game.status);

  let [name, setName] = useState('qwerty')

  return (
    <div className='game'>
      {status >= -1 && (<Fragment><Game></Game><Row></Row></Fragment>)}
      {status !== -1 && (<Row>
        <input type='text' onChange={e => setName(e.target.value)} value={name}></input>
        <button onClick={() => dispatch(start1(name))}>New game</button>
      </Row>)}
    </div>
  );
}

export default App;
