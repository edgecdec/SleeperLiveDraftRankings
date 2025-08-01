import React, { useState, useEffect } from 'react';
import DraggablePositionSection from './DraggablePositionSection';
import { POSITION_COLORS } from '../constants/positions';

const DraggablePositionGrid = ({ positions, draftInfo }) => {
  const [sectionOrder, setSectionOrder] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // Generate dynamic position order based on league roster requirements
  const generatePositionOrder = (draftInfo, positions) => {
    const order = ['ALL']; // Always start with ALL
    
    if (!draftInfo?.settings) {
      // Fallback to default order if no draft info
      return ['ALL', 'FLEX', 'SUPER_FLEX', 'REC_FLEX', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];
    }
    
    const settings = draftInfo.settings;
    
    // Add multi-position cards first (most positions together → fewer positions)
    const flexPositions = [
      { key: 'SUPER_FLEX', slots: settings.slots_super_flex, positionCount: 4 }, // QB/RB/WR/TE
      { key: 'FLEX', slots: settings.slots_flex, positionCount: 3 }, // RB/WR/TE
      { key: 'REC_FLEX', slots: 1, positionCount: 2 } // WR/TE (assuming leagues might have this)
    ];
    
    flexPositions
      .filter(pos => pos.slots > 0 && positions[pos.key] && positions[pos.key].length > 0)
      .sort((a, b) => b.positionCount - a.positionCount) // Most positions first
      .forEach(pos => order.push(pos.key));
    
    // Then add individual positions in roster order (typical draft importance)
    const rosterPositions = [
      { key: 'QB', slots: settings.slots_qb },
      { key: 'RB', slots: settings.slots_rb },
      { key: 'WR', slots: settings.slots_wr },
      { key: 'TE', slots: settings.slots_te },
      { key: 'K', slots: settings.slots_k },
      { key: 'DST', slots: settings.slots_def }
    ];
    
    rosterPositions
      .filter(pos => pos.slots > 0 && positions[pos.key] && positions[pos.key].length > 0)
      .forEach(pos => order.push(pos.key));
    
    return order;
  };

  // Update section order when draft info or positions change
  useEffect(() => {
    const dynamicOrder = generatePositionOrder(draftInfo, positions);
    
    // Try to load saved order from localStorage
    const savedOrder = localStorage.getItem('positionSectionOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // Only use saved order if it contains the same positions as dynamic order
        const dynamicSet = new Set(dynamicOrder);
        const savedSet = new Set(parsedOrder);
        const setsEqual = dynamicSet.size === savedSet.size && [...dynamicSet].every(x => savedSet.has(x));
        
        if (setsEqual) {
          setSectionOrder(parsedOrder);
          return;
        }
      } catch (e) {
        console.warn('Failed to load saved position order:', e);
      }
    }
    
    // Use dynamic order if no valid saved order
    setSectionOrder(dynamicOrder);
  }, [draftInfo, positions]);

  // Save order to localStorage
  const saveOrder = (newOrder) => {
    setSectionOrder(newOrder);
    localStorage.setItem('positionSectionOrder', JSON.stringify(newOrder));
  };

  const handleDragStart = (e, index) => {
    setIsDragging(true);
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/html'));
    
    if (draggedIndex !== dropIndex) {
      const newOrder = [...sectionOrder];
      const draggedItem = newOrder[draggedIndex];
      
      // Remove dragged item
      newOrder.splice(draggedIndex, 1);
      
      // Insert at new position
      newOrder.splice(dropIndex, 0, draggedItem);
      
      saveOrder(newOrder);
    }
    
    setIsDragging(false);
    setDragIndex(null);
  };

  const getSectionConfig = (sectionKey) => {
    return POSITION_COLORS[sectionKey] || POSITION_COLORS.ALL;
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Drag sections by the grip handle to reorder them. Click the chevron to collapse/expand sections.
        </p>
      </div>

      {/* Draggable sections in responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sectionOrder.map((sectionKey, index) => {
          const config = getSectionConfig(sectionKey);
          const sectionPlayers = positions[sectionKey] || [];
          
          return (
            <DraggablePositionSection
              key={sectionKey}
              index={index}
              title={config.name}
              players={sectionPlayers}
              icon={config.icon}
              color={config.color}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={isDragging}
              dragIndex={dragIndex}
              allPositions={positions} // Pass all positions for tier calculation
            />
          );
        })}
      </div>

      {/* Reset button */}
      <div className="text-center">
        <button
          onClick={() => saveOrder(['ALL', 'FLEX', 'QB', 'RB', 'WR', 'TE', 'K'])}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Reset to default order
        </button>
      </div>
    </div>
  );
};

export default DraggablePositionGrid;
