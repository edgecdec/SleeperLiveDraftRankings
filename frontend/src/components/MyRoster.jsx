import React from 'react';
import clsx from 'clsx';
import { useRosterData } from '../hooks/useRosterData';
import { getAllStartersAndBench } from '../utils/rosterUtils';
import RosterHeader from './roster/RosterHeader';
import RosterSection from './roster/RosterSection';
import RosterLegend from './roster/RosterLegend';
import RosterLoadingState from './roster/RosterLoadingState';
import RosterErrorState from './roster/RosterErrorState';
import RosterEmptyState from './roster/RosterEmptyState';

const MyRoster = ({ leagueId, username, draftId, isVisible = true, lastUpdated, isSidebar = false, data }) => {
  console.log('MyRoster: Component rendered with props:', { leagueId, username, draftId, isVisible, isSidebar });
  
  const { rosterData, loading, error } = useRosterData(leagueId, username, draftId, isVisible, lastUpdated, data);

  if (!isVisible) return null;
  if (loading) return <RosterLoadingState />;
  if (error) return <RosterErrorState error={error} />;
  if (!rosterData) return null;
  if (!rosterData.roster_settings) return <RosterEmptyState isSidebar={isSidebar} />;

  const { starters, bench, emptyStarters, emptyBench } = getAllStartersAndBench(rosterData);
  const totalPlayers = starters.length + bench.length;
  const totalSlots = starters.length + emptyStarters.length + bench.length + emptyBench.length;

  return (
    <div className={clsx(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
      isSidebar ? "p-3" : "p-4"
    )}>
      <RosterHeader
        username={rosterData.username}
        totalPlayers={totalPlayers}
        totalSlots={totalSlots}
        draftedThisDraft={rosterData.drafted_this_draft || 0}
        isSidebar={isSidebar}
      />

      <div className="space-y-4">
        <RosterSection
          title="Starting Lineup"
          players={starters}
          emptySlots={emptyStarters}
          isStarter={true}
        />

        <RosterSection
          title="Bench"
          players={bench}
          emptySlots={emptyBench}
          isStarter={false}
        />
      </div>

      <RosterLegend rosterSettings={rosterData.roster_settings} />
    </div>
  );
};

export default MyRoster;
