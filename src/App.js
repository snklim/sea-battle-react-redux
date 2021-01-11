import './App.css';
import classNames from 'classnames';
import { useEffect, Fragment } from 'react';
import { useSelector, useDispatch, } from 'react-redux';
import { start, move } from './store';

function Cell({ row, column, index }) {
  let field = useSelector(state => state.game.fields[index]);
  let nextPlayer = useSelector(state => state.game.nextPlayer);
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
      if (nextPlayer === 1) {
        dispatch(move({ x: cell.x, y: cell.y, fieldIndex: index }));
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
      if (!!nextMove && nextPlayer === 0)
        dispatch(move({ x: nextMove.x, y: nextMove.y, fieldIndex: 0 }));
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
  let status = useSelector(state => state.game.status);

  return (
    <Fragment>
      {status === -1 && nextPlayer === 1 && <Row><span>Your turn</span></Row>}
      {status === -1 && nextPlayer !== 1 && <Row><span>Opponent turn</span></Row>}
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
      <Bot></Bot>
    </Fragment>
  );
}

function App() {
  let dispatch = useDispatch();
  let status = useSelector(state => state.game.status);

  useEffect(() => { if (status === -2) dispatch(start()) })

  return (
    <div className='game'>
      {status >= -1 && (<Fragment><Game></Game><Row></Row></Fragment>)}
      {status > -1 && (<Row>
        <button onClick={() => dispatch(start())}>New game</button>
      </Row>)}
    </div>
  );
}

export default App;
