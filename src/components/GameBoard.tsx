import React, { FC, useEffect, useMemo } from 'react';
import { Socket } from 'socket.io';
import RoundInfo from '../components/RoundInfo';
import GameDeck from '../components/GameDeck';
import CheckIcon from '../components/svg/check.svg'
import MinusIcon from '../components/svg/minus.svg'
import ScoreInfo from "./ScoreInfo";

interface Props {
  game: Game,
  socketGame: Socket;
  player: Player;
}

const GameBoard: FC<Props> = ({ game, socketGame, player }) => {

  const handleClickNextRound = () => {
    socketGame.emit('game-next-round');
  }

  const handlePlayerMove = (game: Game) => {
    socketGame.emit('game-move', game);
  }

  const onEndTurn = (e) => {
    e.target.disabled = true; // prevent double click
    socketGame.emit('game-end-turn');
  }
  const onHasWord = () => {
    socketGame.emit('game-has-word', player.uid);
  }

  const readyToPlay = () => {
    socketGame.emit('game-ready-to-play', player.uid)
  }

  const isReadyPlayer = useMemo(() => {
    return game.readyPlayers.find(x => x === player.uid) !== undefined;
  }, [game, player]);

  const isAllReady = () => {
    return game.allPlayersReadyToGame;
  }

  const isRoundStarted = useMemo(() => {
    return game.rounds.length > 0;
  }, [game.rounds]);

  const isMyTurn = useMemo(() => {
    return game.currentHand === player.uid;
  }, [game, player]);

  const iSaidWord = useMemo(() => {
    return game.playerHasWord === player.uid;
  }, [game, player]);

  const isHandWithRightCardsCount = useMemo(() => {
    if (!game.rounds.length) {
      return true;
    }
    return game.rounds[0].hands[`${player.uid}`].length === game.rounds.length + 2;
  }, [game]);

  const canIEndTurn = useMemo(() => {
    if (isRoundStarted && isMyTurn && isHandWithRightCardsCount) {
      return !(game.isLastCircle && iSaidWord);
    }

    return false;
  }, [isRoundStarted, isMyTurn, game, iSaidWord]);

  const canISayWord = useMemo(() => {
    if (isRoundStarted && isHandWithRightCardsCount) {
      return !game.playerHasWord && isMyTurn;
    }
    return false;
  }, [isRoundStarted, game]);

  const showScore = () => {
    return true
  }

  const gameStarted = useMemo(() => game.gameStatus !== 'notStarted', [game]);

  const canIStarNewRound = useMemo(() => {
    switch (game.gameStatus) {
      case 'notStarted':
        return game.allPlayersReadyToGame;
      case 'started':
      case 'endRound':
        return isMyTurn && game.isLastCircle && iSaidWord;
      case 'finished':
      case 'lastRound':
      default:
        return false;
    }
  }, [isMyTurn, game, iSaidWord]);

  useEffect(() => {
    if (game.gameStatus === 'endRound') {
      // todo here we can process end round
    }
    if (game.gameStatus === 'finished') {
      // todo here we can process end game
      // calcRoundScore(game.rounds[0]);
      // calcGameScore(game);
    }
  }, [game]);

  return (
    <>
      <div className='md:w-5/6'>
        <div className='flex m-1.5 mb-2'>
          <button onClick={ handleClickNextRound } disabled={ !canIStarNewRound || !isAllReady }>
            { gameStarted ? 'Next Round' : 'Start Game' }
          </button>
          <button onClick={ onEndTurn } disabled={ !canIEndTurn }>End Turn</button>
          <button onClick={ onHasWord } disabled={ !canISayWord }>I has word</button>
        </div>
        {
          game.rounds.length > 0 && (
            <GameDeck game={ game } player={ player } handleMove={ handlePlayerMove } isMyTurn={ isMyTurn }/>
          )
        }
      </div>
      <div className='md:w-1/6 p-1.5 flex flex-col items-start'>
        <button onClick={ readyToPlay } disabled={ isReadyPlayer }
                className='m-0 mb-2'>
          { 'I\'m Ready' }
        </button>
        { gameStarted && <RoundInfo game={ game }/> }
        <div className='flex text-lg font-bold'>Players:</div>
        <ul className='mb-2'>{
          game.players.map(p => (
            <li key={ p.uid }>{ game.readyPlayers.includes(p.uid)
              ? <CheckIcon style={ { color: 'lightgreen' } }/>
              : <MinusIcon style={ { color: 'hotpink' } }/> } { p.username }
            </li>))
        }</ul>
        { showScore && <ScoreInfo game={ game }/> }
        <button onClick={ () => socketGame.emit('game-reset') }
                className='mt-auto' disabled={ false }>Reset
        </button>
        <button onClick={ () => socketGame.emit('log-state') }
                className='mt-2' disabled={ false }>Log
        </button>
      </div>
    </>
  );
};

export default GameBoard;