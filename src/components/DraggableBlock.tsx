import React, { FC, useMemo } from 'react';
import { iCards } from '../components/GameDeck';
import LetterCard from '../components/LetterCard';
import { Draggable } from 'react-beautiful-dnd';


interface Props {
  cards: Deck;
  block: keyof iCards;
  limit?: number;
  provided: any;
  snapshot: any;
  isMyTurn: boolean;
  gotCardFromDeck: boolean;
  gotCardFromTable: boolean;
}

const DraggableBlock: FC<Props> = (
  {
    cards,
    block,
    limit = undefined,
    provided,
    snapshot,
    isMyTurn,
    gotCardFromDeck,
    gotCardFromTable
  }
) => {
  const showCards = useMemo(() => {
    if (limit) {
      return cards.slice(0, limit);
    }

    return cards;
  }, [cards, limit]);

  const isDraggable = (part: keyof iCards) => {
    let result = false;
    switch (part) {
      case 'deck':
        result = !isMyTurn || gotCardFromDeck;
        break;
      case 'table':
        result = !isMyTurn || gotCardFromTable;
        break;
      default:
        break;
    }
    console.log(part, result);
    return result;
  }

  return (
    <div ref={ provided.innerRef } className='min-h-40 m-1 flex flex-wrap'
         style={ { display: 'flex', outline: snapshot.isDraggingOver ? '1px solid red' : '0' } }>
      {
        showCards.map((card, index) => (
          <Draggable
            key={ card.id }
            draggableId={ card.id }
            index={ index }
            isDragDisabled={ isDraggable(block) }
          >
            { (provided, snapshot) => (
              <div
                ref={ provided.innerRef }
                { ...provided.draggableProps }
                { ...provided.dragHandleProps }
                style={ {
                  display: 'flex',
                  userSelect: 'none',
                  marginRight: `${ block === 'deck' || block === 'table' ? '-110px' : '0' }`,
                  border: snapshot.isDragging ? '1px solid red' : '0',
                  ...provided.draggableProps.style,
                } }
              >
                <LetterCard key={ card.id } isOpen={ block !== 'deck' } card={ card }/>
              </div>
            ) }
          </Draggable>
        ))
      }
      { provided.placeholder }
    </div>
  );
};

export default DraggableBlock;