import React from 'react';
import PositionSection from './PositionSection';
import { POSITION_COLORS } from '../constants/positions';

const PositionGrid = ({ positions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Top recommendations */}
      <div className="lg:col-span-2 xl:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PositionSection
            title={POSITION_COLORS.ALL.name}
            players={positions.ALL || []}
            icon={POSITION_COLORS.ALL.icon}
            color={POSITION_COLORS.ALL.color}
          />
          <PositionSection
            title={POSITION_COLORS.FLEX.name}
            players={positions.FLEX || []}
            icon={POSITION_COLORS.FLEX.icon}
            color={POSITION_COLORS.FLEX.color}
          />
        </div>
      </div>

      {/* Position-specific sections */}
      <PositionSection
        title={POSITION_COLORS.QB.name}
        players={positions.QB || []}
        icon={POSITION_COLORS.QB.icon}
        color={POSITION_COLORS.QB.color}
      />
      
      <PositionSection
        title={POSITION_COLORS.RB.name}
        players={positions.RB || []}
        icon={POSITION_COLORS.RB.icon}
        color={POSITION_COLORS.RB.color}
      />
      
      <PositionSection
        title={POSITION_COLORS.WR.name}
        players={positions.WR || []}
        icon={POSITION_COLORS.WR.icon}
        color={POSITION_COLORS.WR.color}
      />
      
      <PositionSection
        title={POSITION_COLORS.TE.name}
        players={positions.TE || []}
        icon={POSITION_COLORS.TE.icon}
        color={POSITION_COLORS.TE.color}
      />
      
      <PositionSection
        title={POSITION_COLORS.K.name}
        players={positions.K || []}
        icon={POSITION_COLORS.K.icon}
        color={POSITION_COLORS.K.color}
      />
    </div>
  );
};

export default PositionGrid;
