#!/usr/bin/env node

// Test the frontend dynasty/keeper detection logic

const isDynastyOrKeeperLeague = (league) => {
  // Check league settings for dynasty/keeper indicators
  const settings = league.settings || {};
  
  // Dynasty league type
  if (settings.type === 2) return true;
  
  // Has taxi squad (dynasty feature)
  if (settings.taxi_slots > 0) return true;
  
  // Check for ACTUAL keepers being used (more conservative approach)
  // Only consider it a keeper league if max_keepers > 1 to avoid false positives
  // from default Sleeper settings (max_keepers = 1)
  if (settings.max_keepers > 1) return true;
  
  // Check previous league ID with additional context
  // Having a previous league ID alone doesn't guarantee dynasty/keeper
  // It could just be annual league continuation
  if (league.previous_league_id) {
    // Only consider dynasty/keeper if combined with other indicators
    if (settings.max_keepers > 1 || settings.taxi_slots > 0 || settings.type === 2) {
      return true;
    }
    // Otherwise, likely just annual redraft continuation
  }
  
  return false;
};

// Test data based on actual API response
const testLeagues = [
  {
    name: "Guillotine League",
    settings: { type: 0, max_keepers: 1, taxi_slots: 0 },
    previous_league_id: "1121616321009070080"
  },
  {
    name: "Forever League", 
    settings: { type: 2, max_keepers: 1, taxi_slots: 4 },
    previous_league_id: "1049934141544185856"
  },
  {
    name: "Graham's Football Fantasy",
    settings: { type: 0, max_keepers: 1, taxi_slots: 0 },
    previous_league_id: "some-id"
  },
  {
    name: "Graham's Duplicate Dynasty",
    settings: { type: 2, max_keepers: 1, taxi_slots: 3 },
    previous_league_id: "some-id"
  },
  {
    name: "$AMZN #OneRSU 2025",
    settings: { type: 0, max_keepers: 1, taxi_slots: 0 },
    previous_league_id: "some-id"
  }
];

console.log("🧪 Testing Frontend Dynasty/Keeper Detection Logic");
console.log("=" .repeat(60));

testLeagues.forEach(league => {
  const isDynasty = isDynastyOrKeeperLeague(league);
  const status = isDynasty ? "✅ DYNASTY/KEEPER" : "❌ REDRAFT";
  
  console.log(`${status} - ${league.name}`);
  console.log(`   Type: ${league.settings.type}, Max Keepers: ${league.settings.max_keepers}, Taxi: ${league.settings.taxi_slots}, Has Previous: ${!!league.previous_league_id}`);
  console.log();
});

console.log("Expected Results:");
console.log("✅ Forever League (type=2, taxi=4)");
console.log("✅ Graham's Duplicate Dynasty (type=2, taxi=3)");
console.log("❌ All others (type=0, max_keepers=1, taxi=0, only previous_league_id)");
