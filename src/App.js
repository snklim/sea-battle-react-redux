import './App.css';
import classNames from 'classnames';
import { useEffect, Fragment } from 'react';
import { useSelector, useDispatch, } from 'react-redux';
import { cellSelected } from './store';

function Cell({ row, column, index }) {
  let field = useSelector(state => state.game.fields[index]);
  let cell = field[row][column];

  let className = classNames('cell', 'cell-index-' + row + '-' + column, {
    'cell-ship': index === 0 && cell.type === 'O',
    'cell-border': cell.type === 'B',
    'cell-missed': cell.type === 'X',
    'cell-injured': cell.type === 'I',
    'cell-killed': cell.type === 'K',
  });

  let dispatch = useDispatch();

  return (
    <div className={className} onClick={() => {
      if (index === 1) {
        dispatch(cellSelected({ x: cell.x, y: cell.y, fieldIndex: index }));
      }
    }}></div>
  );
}

function Bot() {
  let nextMove = useSelector(state => state.game.nextMove[0]);
  let dispatch = useDispatch();

  useEffect(() => {
    let interval = setInterval(() => {
      dispatch(cellSelected({ x: nextMove.x, y: nextMove.y, fieldIndex: 0 }));
    }, 500);
    return () => clearInterval(interval);
  }, [dispatch, nextMove]);

  return (<Fragment></Fragment>);
}

function Row({ index, children }) {
  let className = classNames('row', 'row-index-' + index);

  return (
    <div className={className}>{children}</div>
  );
}

function Cell2({ cell }) {
  let className = classNames('cell', {
    'cell-ship': cell.type === 'O',
    'cell-killed': cell.type === 'K',
  });

  return (
    <div className={className}></div>
  );
}

function Ship({ fieldIndex, shipIndex }) {
  let ship = useSelector(state => state.game.ships[fieldIndex][shipIndex].ship).map((cell, i) => (<Cell2 key={i} cell={cell}></Cell2>));
  return (<Row>{ship}</Row>);
}

function Ships({ index }) {
  let ships = [];

  for (let i = 0; i < 10; i++)
    ships.push(<Ship key={i} fieldIndex={index} shipIndex={i}></Ship>)

  return (<div>{ships}</div>);
}

function Info() {

  let opponentAvailableMoves = useSelector(state => state.game.availableMoves[0]);
  let availableMoves = useSelector(state => state.game.availableMoves[1]);
  let nextPlayer = useSelector(state => state.game.nextPlayer);

  return (
    <Fragment>
      <Row><span>Your available moves: {availableMoves.length}</span></Row>
      <Row><span>Opponent available moves: {opponentAvailableMoves.length}</span></Row>
      {nextPlayer === 1 && <Row><span>Your turn</span></Row>}
      {nextPlayer !== 1 && <Row><span>Opponent turn</span></Row>}
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
      <Ships index={index}></Ships>
    </div>
  );
}

function Game() {
  return (
    <div className='game'>
      <Row>
        <Info></Info>
      </Row>
      <Field index={0}></Field>
      <Field index={1}></Field>
      <Row>
        <button onClick={() => console.log('New game')}>New game</button>
      </Row>
      <Bot></Bot>
    </div>
  );
}

function App() {
  return (
    <Game></Game>
  );
}

export default App;
