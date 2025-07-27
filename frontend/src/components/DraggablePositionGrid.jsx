import React, { useState, useEffect } from 'react';
import DraggablePositionSection from './DraggablePositionSection';
import { POSITION_COLORS } from '../constants/positions';

const DraggablePositionGrid = ({ positions }) => {
  const [sectionOrder, setSectionOrder] = useState([
    'ALL',
    'FLEX', 
    'QB',
    'RB',
    'WR',
    'TE',
    'K'
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('positionSectionOrder');
    if (savedOrder) {
      try {
        setSectionOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.warn('Failed to load saved position order:', e);
      }
    }
  }, []);

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

      {/* Draggable sections in 2-column grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
