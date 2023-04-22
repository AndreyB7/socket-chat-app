import React, { FC, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import DraggableBlock from '../components/DraggableBlock';
import HandsList from "./HandsList";

interface Props {
  player: Player;
  game: Game;
  handleMove: (game: Game) => void;
  isMyTurn: boolean;
}

export interface iCards {
  deck: Deck;
  table: Deck;
  drop: Deck;
  playerHand: Deck;
}

const partNames = {
  deck: 'Deck',
  table: 'Discard',
  drop: 'Subtract',
  playerHand: 'My Hand',
}

const GameDeck: FC<Props> = ({ game, player, handleMove, isMyTurn }) => {

  const [cards, setCards] = useState<iCards>({
    deck: game.rounds[0].deck,
    table: game.rounds[0].table,
    drop: [],
    playerHand: game.rounds[0].hands[`${ player.uid }`],
  });

  useEffect(() => {
    setCards({
      deck: game.rounds[0].deck,
      table: game.rounds[0].table,
      drop: [],
      playerHand: game.rounds[0].hands[`${ player.uid }`]
    })
  }, [game])

  // todo this flags we should save to gameState
  const [gotCardFromDeck, setGotCardFromDeck] = useState<boolean>(false);
  const [gotCardFromTable, setGotCardFromTable] = useState<boolean>(false);
  const [putCardToTable, setPutCardToTable] = useState<boolean>(false);

  useEffect(() => {
    setGotCardFromDeck(false);
    setGotCardFromTable(false);
    setPutCardToTable(false);
  }, [isMyTurn]);

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const { source, destination } = result;
    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      const newList = Array.from(cards[source.droppableId]);
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);

      setCards({ ...cards, [source.droppableId]: newList });
      updateGame({ ...cards, [source.droppableId]: newList });
    }
    // Moving to a different list
    else {
      const sourceList = Array.from(cards[source.droppableId]);
      const destinationList = Array.from(cards[destination.droppableId]);
      let removed;
      switch (source.droppableId) {
        case 'table':
        case 'deck':
          removed = sourceList.pop();
          break;
        default:
          removed = sourceList.splice(source.index, 1)[0];
          break;
      }

      switch (destination.droppableId) {
        case 'table':
        case 'deck':
        case 'drop':
          destinationList.push(removed);
          break;
        default:
          destinationList.splice(destination.index, 0, removed);
          break;
      }

      const newCards = {
        ...cards,
        [source.droppableId]: sourceList,
        [destination.droppableId]: destinationList,
      };

      setCards(newCards);
      //updateGame(newCards);

      if (source.droppableId === 'deck') {
        setGotCardFromDeck(true);
      }
      if (source.droppableId === 'table') {
        setGotCardFromTable(true);
      }
      if (destination.droppableId === 'table') {
        setPutCardToTable(true);
      }
    }
  };

  const updateGame = (cards) => {
    game.rounds[0] = {
      ...game.rounds[0],
      deck: cards.deck,
      table: cards.table,
      hands: { [`${ player.uid }`]: cards.playerHand }, // only myHand to avoid other hands sort override
    }
    handleMove(game);
  }

  const opponentsHands = (): { [key: string]: Deck } => {
    const hands = {...game.rounds[0].hands};
    delete hands[`${ player.uid }`];
    return hands;
  }

  const isDropDisabled = (part: keyof iCards) => {
    let result;
    switch (part) {
      case 'deck':
        result = true;
        break;
      case 'table':
        result = !isMyTurn || !(gotCardFromDeck || gotCardFromTable) || putCardToTable;
        break;
      case 'drop':
        result = false;
        break;
      default:
        result = game.gameStatus !== 'started' && game.gameStatus !== 'lastRound';
        break;
    }

    return result;
  }

  const handsList = useMemo(() => (
    <HandsList
      players={ game.players.filter(x => x.uid !== player.uid) }
      hands={ opponentsHands() }
      isOpen={ game.gameStatus === 'endRound' || game.gameStatus === 'finished' }
    />
  ), [game.gameStatus, game.players])

  return (
    <div>
      <DragDropContext onDragEnd={ handleDragEnd }>
        <div className='game-wrap flex flex-wrap'>
          { Object.keys(cards).map((part: keyof iCards) => (
            <div key={ part } className={ `relative ${ part } ${ part === 'playerHand' ? 'w-full' : 'min-w-max' }` }>
              <h3 className='deck-part-title'>{ partNames[part] }</h3>
              <Droppable droppableId={ part } direction="horizontal" isDropDisabled={ isDropDisabled(part) }>
                {
                  (provided, snapshot) => (
                    <DraggableBlock
                      block={ part }
                      cards={ cards[part] }
                      limit={ part === 'deck' ? 2 : part === 'table' ? 2 : undefined }
                      provided={ provided }
                      snapshot={ snapshot }
                      isMyTurn={ isMyTurn }
                      gotCardFromDeck={ gotCardFromDeck }
                      gotCardFromTable={ gotCardFromTable }
                    />
                  )
                }
              </Droppable>
            </div>
          )) }
        </div>
      </DragDropContext>
      {handsList}
    </div>
  );
};

export default GameDeck;