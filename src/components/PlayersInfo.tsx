import CheckIcon from "./svg/check.svg";
import MinusIcon from "./svg/minus.svg";
import PlusIcon from "./svg/plus.svg";
import React, { FC } from "react";

interface Props {
  game: Game;
  player: Player;
  addExtraScore: (uid: UID) => void
}

const PlayersInfo: FC<Props> = ({ game, player, addExtraScore }) => {
  const canAddExtraScore =
    !!game.rounds.length && !game.rounds[0]?.extraScoreAdded
    && player.uid === game.rounds[0]?.croupier
    && (game.gameStatus === 'endRound' || game.gameStatus === 'finished');
  const handleAddScore = (e) => {
    e.currentTarget.disabled = true;
    addExtraScore(e.currentTarget.dataset.uid);
  }

  return (
    <div className='mb-2 w-full'>
      <div className='flex text-lg font-bold'>Players:</div>
      <ul>{
        game.players.map(p => (
          <li key={ p.uid }
              className={ `player mw-200${ (game.currentHand === p.uid) ? ' current' : '' }` }
          >{ game.readyPlayers.includes(p.uid)
            ? <CheckIcon style={ { color: '#00CC33' } }/>
            : <MinusIcon style={ { color: '#FF0033' } }/> }
            <div>{ p.username }</div>
            { game.playerHasWord === p.uid && <div style={{marginLeft:5}}>  Has Word!</div> }
            { canAddExtraScore &&
              <button className='score-plus' data-uid={ p.uid } onClick={ handleAddScore }>
                <PlusIcon style={ { color: '#fff' } }/>
              </button> }
          </li>))
      }</ul>
    </div>
  )
}

export default PlayersInfo;