import React from 'react';
import clsx from 'clsx';
import RosterPlayer from './RosterPlayer';
import EmptyRosterSlot from './EmptyRosterSlot';
import { getStarterTypeDisplay, getStarterTypeColor } from '../../utils/rosterUtils';

const RosterSection = ({ 
  title, 
  players, 
  emptySlots, 
  isStarter = false,
  sectionColor = 'gray',
  borderColor = 'gray-200'
}) => {
  const totalSlots = players.length + emptySlots.length;
  
  const getSectionColors = () => {
    if (isStarter) {
      return {
        header: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800'
      };
    }
    return {
      header: 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700'
    };
  };

  const colors = getSectionColors();

  if (totalSlots === 0) return null;

  return (
    <div className={clsx("border rounded-lg", colors.border)}>
      <div className={clsx(
        "px-3 py-2 border-b flex items-center justify-between",
        colors.header,
        colors.border
      )}>
        <span className={clsx("font-medium uppercase tracking-wide text-sm", colors.text)}>
          {title} ({players.length}/{totalSlots})
        </span>
      </div>
      
      <div className={clsx(isStarter ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800")}>
        {/* Filled positions */}
        {players.map((player, index) => (
          <div
            key={`${isStarter ? 'starter' : 'bench'}-${player.player_id}-${player.starterType || 'bench'}-${index}`}
            className={clsx(
              index !== totalSlots - 1 && "border-b border-gray-200 dark:border-gray-700"
            )}
          >
            <RosterPlayer
              player={player}
              isStarter={isStarter}
              starterTypeDisplay={isStarter ? getStarterTypeDisplay(player.starterType, player.slotNumber) : null}
              starterTypeColor={isStarter ? getStarterTypeColor(player.starterType) : null}
            />
          </div>
        ))}
        
        {/* Empty positions */}
        {emptySlots.map((emptySlot, index) => (
          <EmptyRosterSlot
            key={`empty-${isStarter ? 'starter' : 'bench'}-${emptySlot.starterType || 'bench'}-${emptySlot.slotNumber}`}
            slotType={emptySlot.starterType || 'BENCH'}
            slotDisplay={isStarter 
              ? getStarterTypeDisplay(emptySlot.starterType, emptySlot.slotNumber)
              : 'BENCH'
            }
            isStarter={isStarter}
            isLast={players.length + index === totalSlots - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default RosterSection;
