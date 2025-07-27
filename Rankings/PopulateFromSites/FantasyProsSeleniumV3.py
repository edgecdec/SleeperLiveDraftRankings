#!/usr/bin/env python3
"""
Enhanced Selenium-based FantasyPros scraper with improved tier extraction
"""

import time
import pandas as pd
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Constants import RANKINGS_OUTPUT_DIRECTORY

class FantasyProsSeleniumV3:
    """
    Enhanced Selenium scraper with improved tier extraction
    """
    
    def __init__(self, headless=True):
        self.headless = headless
        self.driver = None
        self.wait = None
    
    def setup_driver(self):
        """Set up the Chrome WebDriver"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        # Additional options for better compatibility
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # Disable images and CSS for faster loading
        prefs = {
            "profile.managed_default_content_settings.images": 2,
            "profile.default_content_setting_values.notifications": 2
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, 30)
            print("✓ Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            print(f"✗ Failed to initialize Chrome WebDriver: {e}")
            return False
    
    def inspect_page_data(self):
        """Inspect the page to understand the data structure"""
        print("🔍 Inspecting page data structure...")
        
        # Look for all possible data sources
        js_scripts = [
            # Check for ecrData
            """
            if (typeof ecrData !== 'undefined') {
                return {
                    type: 'ecrData',
                    hasPlayers: !!ecrData.players,
                    playerCount: ecrData.players ? ecrData.players.length : 0,
                    samplePlayer: ecrData.players ? ecrData.players[0] : null,
                    allKeys: ecrData.players && ecrData.players.length > 0 ? Object.keys(ecrData.players[0]) : []
                };
            }
            return null;
            """,
            
            # Check for other common data variables
            """
            var dataVars = ['rankings', 'players', 'data', 'rankingsData', 'playerData'];
            for (var i = 0; i < dataVars.length; i++) {
                var varName = dataVars[i];
                if (typeof window[varName] !== 'undefined') {
                    var data = window[varName];
                    return {
                        type: varName,
                        hasData: !!data,
                        isArray: Array.isArray(data),
                        length: data.length || Object.keys(data).length,
                        sampleItem: Array.isArray(data) ? data[0] : data,
                        keys: typeof data === 'object' ? Object.keys(data) : []
                    };
                }
            }
            return null;
            """,
            
            # Look for tier-related data
            """
            // Search for tier-related variables
            var tierVars = [];
            for (var prop in window) {
                if (prop.toLowerCase().includes('tier') || 
                    (typeof window[prop] === 'object' && window[prop] && 
                     JSON.stringify(window[prop]).toLowerCase().includes('tier'))) {
                    tierVars.push({
                        name: prop,
                        type: typeof window[prop],
                        value: window[prop]
                    });
                }
            }
            return tierVars.length > 0 ? tierVars : null;
            """
        ]
        
        for i, script in enumerate(js_scripts):
            try:
                result = self.driver.execute_script(script)
                if result:
                    print(f"📊 Data source {i+1} found:")
                    print(json.dumps(result, indent=2, default=str))
                    return result
            except Exception as e:
                print(f"Script {i+1} failed: {e}")
        
        return None
    
    def extract_tier_data_enhanced(self):
        """Enhanced tier data extraction with multiple strategies"""
        print("🎯 Attempting enhanced tier extraction...")
        
        # Strategy 1: Look for tier data in ecrData with different field names
        tier_extraction_scripts = [
            # Standard tier field
            """
            if (typeof ecrData !== 'undefined' && ecrData.players) {
                return ecrData.players.map(function(player, index) {
                    return {
                        name: player.player_name,
                        rank: player.rank_ecr,
                        tier: player.tier || player.player_tier || player.rank_tier || 1,
                        position: player.player_position_id
                    };
                });
            }
            return null;
            """,
            
            # Look for tier breaks or tier boundaries
            """
            if (typeof ecrData !== 'undefined' && ecrData.players) {
                // Try to calculate tiers based on rank breaks
                var players = ecrData.players;
                var tierBreaks = [1, 6, 12, 24, 36, 48, 60, 80, 100, 120, 150, 200];
                
                return players.map(function(player, index) {
                    var rank = player.rank_ecr || index + 1;
                    var tier = 1;
                    
                    for (var i = 0; i < tierBreaks.length; i++) {
                        if (rank <= tierBreaks[i]) {
                            tier = i + 1;
                            break;
                        }
                    }
                    
                    return {
                        name: player.player_name,
                        rank: rank,
                        tier: tier,
                        position: player.player_position_id,
                        calculated: true
                    };
                });
            }
            return null;
            """,
            
            # Look for DOM-based tier information
            """
            var tierElements = document.querySelectorAll('[class*="tier"], [data-tier], .tier-');
            if (tierElements.length > 0) {
                var tierData = [];
                for (var i = 0; i < tierElements.length; i++) {
                    var el = tierElements[i];
                    var tierInfo = {
                        element: el.tagName,
                        className: el.className,
                        textContent: el.textContent,
                        dataTier: el.getAttribute('data-tier')
                    };
                    tierData.push(tierInfo);
                }
                return tierData;
            }
            return null;
            """,
            
            # Look for CSS-based tier styling
            """
            if (typeof ecrData !== 'undefined' && ecrData.players) {
                // Try to extract tier info from any available fields
                var players = ecrData.players;
                var samplePlayer = players[0];
                var availableFields = Object.keys(samplePlayer);
                
                var tierFields = availableFields.filter(function(field) {
                    return field.toLowerCase().includes('tier') || 
                           field.toLowerCase().includes('group') ||
                           field.toLowerCase().includes('bracket');
                });
                
                return {
                    availableFields: availableFields,
                    tierFields: tierFields,
                    sampleData: samplePlayer
                };
            }
            return null;
            """
        ]
        
        for i, script in enumerate(tier_extraction_scripts):
            try:
                print(f"Trying tier extraction strategy {i+1}...")
                result = self.driver.execute_script(script)
                
                if result:
                    print(f"✅ Strategy {i+1} found tier data!")
                    if isinstance(result, list) and len(result) > 0:
                        # Show sample of tier data
                        print("Sample tier data:")
                        for j, item in enumerate(result[:5]):
                            print(f"  {j+1}. {item}")
                        return result
                    else:
                        print(f"Result: {json.dumps(result, indent=2, default=str)}")
                        
            except Exception as e:
                print(f"Strategy {i+1} failed: {e}")
        
        return None
    
    def scrape_superflex_rankings(self, scoring_format='half_ppr'):
        """
        Scrape true superflex rankings with enhanced tier detection
        """
        if not self.setup_driver():
            return None
        
        try:
            # URL mapping for different scoring formats
            urls = {
                'standard': 'https://www.fantasypros.com/nfl/rankings/superflex-cheatsheets.php',
                'half_ppr': 'https://www.fantasypros.com/nfl/rankings/superflex-half-point-ppr-cheatsheets.php',
                'ppr': 'https://www.fantasypros.com/nfl/rankings/superflex-ppr-cheatsheets.php'
            }
            
            url = urls.get(scoring_format, urls['half_ppr'])
            print(f"Loading FantasyPros page: {url}")
            
            # Load the page
            self.driver.get(url)
            
            # Wait for the page to load completely
            print("Waiting for page to load...")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Wait for JavaScript to load
            time.sleep(5)
            
            # Inspect page data structure
            self.inspect_page_data()
            
            # Get initial data to compare later
            print("Getting initial player data...")
            initial_data = self.extract_player_data()
            initial_josh_rank = self.get_josh_allen_rank(initial_data) if initial_data else None
            print(f"Initial Josh Allen rank: {initial_josh_rank}")
            
            # Try enhanced tier extraction
            tier_data = self.extract_tier_data_enhanced()
            
            # Try to click the superflex tab
            print("Looking for and clicking superflex tab...")
            superflex_clicked = self.click_superflex_tab()
            
            if superflex_clicked:
                print("✓ Successfully clicked superflex tab")
                
                # Wait longer for data to update
                print("Waiting for data to update after tab click...")
                time.sleep(8)
                
                # Check if data actually changed
                updated_data = self.extract_player_data()
                updated_josh_rank = self.get_josh_allen_rank(updated_data) if updated_data else None
                print(f"Updated Josh Allen rank: {updated_josh_rank}")
                
                if updated_josh_rank and initial_josh_rank and updated_josh_rank != initial_josh_rank:
                    print(f"✓ Data changed! Josh Allen rank: {initial_josh_rank} → {updated_josh_rank}")
                    return self.process_player_data(updated_data, scoring_format, True, tier_data)
                elif updated_josh_rank and updated_josh_rank <= 15:
                    print(f"✓ Josh Allen ranked {updated_josh_rank} - looks like superflex data!")
                    return self.process_player_data(updated_data, scoring_format, True, tier_data)
                else:
                    print("⚠️  Data doesn't seem to have changed to superflex rankings")
                    
                    # Try alternative approaches
                    print("Trying alternative superflex detection methods...")
                    alternative_data = self.try_alternative_superflex_methods()
                    if alternative_data:
                        return self.process_player_data(alternative_data, scoring_format, True, tier_data)
                    
                    # Fall back to the updated data anyway
                    return self.process_player_data(updated_data or initial_data, scoring_format, False, tier_data)
            else:
                print("⚠️  Could not click superflex tab, using default data")
                return self.process_player_data(initial_data, scoring_format, False, tier_data)
                
        except Exception as e:
            print(f"✗ Error during scraping: {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            if self.driver:
                self.driver.quit()
                print("✓ WebDriver closed")
    
    def get_josh_allen_rank(self, players_data):
        """Get Josh Allen's rank from player data"""
        if not players_data:
            return None
        
        for player in players_data:
            if isinstance(player, dict) and 'Josh Allen' in player.get('player_name', ''):
                return player.get('rank_ecr')
        return None
    
    def click_superflex_tab(self):
        """Click superflex tab using multiple strategies"""
        strategies = [
            self.click_by_text,
            self.click_by_attributes,
            self.click_by_javascript,
            self.click_by_position_filter
        ]
        
        for i, strategy in enumerate(strategies):
            try:
                print(f"Trying strategy {i+1}: {strategy.__name__}")
                if strategy():
                    return True
            except Exception as e:
                print(f"Strategy {i+1} failed: {e}")
                continue
        
        return False
    
    def click_by_text(self):
        """Click superflex tab by finding text"""
        selectors = [
            "//button[contains(text(), 'Superflex')]",
            "//a[contains(text(), 'Superflex')]",
            "//li[contains(text(), 'Superflex')]",
            "//div[contains(text(), 'Superflex')]",
            "//span[contains(text(), 'Superflex')]"
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.XPATH, selector)
                if element and element.is_displayed():
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
                    time.sleep(1)
                    
                    try:
                        element.click()
                        return True
                    except:
                        self.driver.execute_script("arguments[0].click();", element)
                        return True
            except:
                continue
        return False
    
    def click_by_attributes(self):
        """Click superflex tab by finding data attributes"""
        selectors = [
            "//*[@data-position='OP']",
            "//*[contains(@data-position, 'OP')]",
            "//*[@value='OP']",
            "//*[contains(@value, 'OP')]"
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.XPATH, selector)
                if element and element.is_displayed():
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
                    time.sleep(1)
                    self.driver.execute_script("arguments[0].click();", element)
                    return True
            except:
                continue
        return False
    
    def click_by_javascript(self):
        """Use JavaScript to find and click superflex elements"""
        js_scripts = [
            """
            var elements = document.querySelectorAll('*');
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var text = (el.textContent || el.innerText || '').toLowerCase();
                if (text.includes('superflex') && el.offsetParent !== null) {
                    el.click();
                    return true;
                }
            }
            return false;
            """,
            
            """
            var elements = document.querySelectorAll('[data-position="OP"], [value="OP"]');
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].offsetParent !== null) {
                    elements[i].click();
                    return true;
                }
            }
            return false;
            """
        ]
        
        for script in js_scripts:
            try:
                result = self.driver.execute_script(script)
                if result:
                    return True
            except:
                continue
        return False
    
    def click_by_position_filter(self):
        """Try to change position filter programmatically"""
        try:
            js_script = """
            var selects = document.querySelectorAll('select');
            for (var i = 0; i < selects.length; i++) {
                var options = selects[i].querySelectorAll('option');
                for (var j = 0; j < options.length; j++) {
                    if (options[j].value === 'OP' || options[j].textContent.includes('Superflex')) {
                        selects[i].value = options[j].value;
                        selects[i].dispatchEvent(new Event('change'));
                        return true;
                    }
                }
            }
            return false;
            """
            
            result = self.driver.execute_script(js_script)
            return result
        except:
            return False
    
    def try_alternative_superflex_methods(self):
        """Try alternative methods to get superflex data"""
        print("Trying to trigger superflex data update...")
        
        # Try refreshing the page with position parameter
        try:
            current_url = self.driver.current_url
            if '?' in current_url:
                new_url = current_url + '&position=OP'
            else:
                new_url = current_url + '?position=OP'
            
            print(f"Trying URL with position parameter: {new_url}")
            self.driver.get(new_url)
            time.sleep(5)
            
            data = self.extract_player_data()
            josh_rank = self.get_josh_allen_rank(data)
            
            if josh_rank and josh_rank <= 15:
                print(f"✓ URL parameter method worked! Josh Allen rank: {josh_rank}")
                return data
        except Exception as e:
            print(f"URL parameter method failed: {e}")
        
        return None
    
    def extract_player_data(self):
        """Extract player data from the page JavaScript"""
        try:
            js_script = """
            if (typeof ecrData !== 'undefined' && ecrData.players) {
                return ecrData.players;
            }
            return null;
            """
            
            players_data = self.driver.execute_script(js_script)
            
            if players_data:
                return players_data
            
            # If ecrData doesn't exist, try to find it in script tags
            script_elements = self.driver.find_elements(By.TAG_NAME, "script")
            
            for script in script_elements:
                try:
                    script_content = script.get_attribute("innerHTML")
                    if script_content and "ecrData" in script_content:
                        match = re.search(r'var ecrData = ({.*?});', script_content, re.DOTALL)
                        if match:
                            data_str = match.group(1)
                            data = json.loads(data_str)
                            if 'players' in data:
                                return data['players']
                except Exception as e:
                    continue
            
            return None
            
        except Exception as e:
            print(f"Error extracting player data: {e}")
            return None
    
    def process_player_data(self, players_data, scoring_format, is_superflex_data, tier_data=None):
        """Process the player data into a DataFrame with enhanced tier handling"""
        if not players_data:
            print("No player data to process")
            return None
        
        print(f"Processing {len(players_data)} players...")
        
        # Create tier lookup if we have enhanced tier data
        tier_lookup = {}
        if tier_data and isinstance(tier_data, list):
            for item in tier_data:
                if isinstance(item, dict) and 'name' in item and 'tier' in item:
                    tier_lookup[item['name']] = item['tier']
            print(f"✅ Created tier lookup with {len(tier_lookup)} entries")
        
        position_counters = {'QB': 0, 'RB': 0, 'WR': 0, 'TE': 0, 'K': 0, 'DST': 0}
        
        overall_ranks = []
        names = []
        positions = []
        teams = []
        byes = []
        position_ranks = []
        tiers = []
        
        for player in players_data:
            if isinstance(player, dict):
                name = player.get('player_name', '').strip()
                team = player.get('player_team_id', '').strip()
                pos = player.get('player_position_id', '').strip()
                bye = player.get('player_bye_week', '0')
                rank = player.get('rank_ecr', 0)
                
                # Enhanced tier extraction
                tier = 1  # Default
                
                # Try tier lookup first
                if name in tier_lookup:
                    tier = tier_lookup[name]
                else:
                    # Try various tier fields from the player data
                    tier_fields = ['tier', 'player_tier', 'rank_tier', 'tier_rank', 'group', 'bracket']
                    for field in tier_fields:
                        if field in player and player[field] is not None:
                            tier = player[field]
                            break
                    
                    # If still no tier, calculate based on rank
                    if tier == 1 and rank > 0:
                        tier = self.calculate_tier_from_rank(rank, pos)
                
                # Skip if essential data is missing
                if not name or not pos:
                    continue
                
                # Skip DST for now
                if pos == 'DST':
                    continue
                
                # Handle bye week
                if bye is None or bye == '':
                    bye = '0'
                else:
                    bye = str(bye)
                
                # Increment position counter
                if pos in position_counters:
                    position_counters[pos] += 1
                    pos_rank = position_counters[pos]
                else:
                    pos_rank = 1
                
                # Append data to lists
                overall_ranks.append(rank)
                names.append(name)
                positions.append(pos)
                teams.append(team)
                byes.append(bye)
                position_ranks.append(pos_rank)
                tiers.append(tier)
        
        # Create DataFrame
        df = pd.DataFrame({
            'Overall Rank': overall_ranks,
            'Name': names,
            'Position': positions,
            'Team': teams,
            'Bye': byes,
            'Position Rank': position_ranks,
            'Tier': tiers
        })
        
        # Sort by overall rank
        df = df.sort_values('Overall Rank').reset_index(drop=True)
        
        # Generate output filename - simple naming without versions
        suffix = 'superflex' if is_superflex_data else 'standard'
        filename = f'FantasyPros_Rankings_{scoring_format}_{suffix}.csv'
        
        output_path = f'{RANKINGS_OUTPUT_DIRECTORY}{filename}'
        df.to_csv(output_path, index=False)
        
        print(f"Successfully processed {len(df)} players")
        print(f"Data saved to: {output_path}")
        
        # Display results with tier analysis
        if len(df) > 0:
            print(f"\nFirst 15 players ({scoring_format} {suffix}):")
            print(df.head(15)[['Overall Rank', 'Name', 'Position', 'Team', 'Tier']].to_string(index=False))
            
            # Show tier distribution
            print(f"\nTier distribution:")
            tier_counts = df['Tier'].value_counts().sort_index()
            for tier, count in tier_counts.items():
                print(f"  Tier {tier}: {count} players")
            
            # Show QB rankings with tiers
            qbs = df[df['Position'] == 'QB'].head(10)
            if len(qbs) > 0:
                print(f"\nTop 10 QBs with tiers:")
                for _, qb in qbs.iterrows():
                    print(f"  {qb['Overall Rank']:3d}. {qb['Name']} ({qb['Team']}) - Tier {qb['Tier']}")
                
                # Analyze if this looks like superflex data
                top_qb_rank = qbs.iloc[0]['Overall Rank']
                if top_qb_rank <= 15:
                    print(f"\n🎯 This looks like SUPERFLEX data! (Top QB ranked {top_qb_rank})")
                else:
                    print(f"\n⚠️  This looks like STANDARD data (Top QB ranked {top_qb_rank})")
        
        return df
    
    def calculate_tier_from_rank(self, rank, position):
        """Calculate tier based on overall rank and position"""
        # Position-specific tier breaks (approximate)
        tier_breaks = {
            'QB': [12, 24, 36, 48],  # QB tiers are more spread out
            'RB': [12, 24, 36, 48, 60],
            'WR': [12, 24, 36, 48, 60, 72],
            'TE': [6, 12, 18, 24, 30],
            'K': [8, 16, 24],
            'DST': [8, 16, 24]
        }
        
        breaks = tier_breaks.get(position, [12, 24, 36, 48, 60])
        
        for i, break_point in enumerate(breaks):
            if rank <= break_point:
                return i + 1
        
        return len(breaks) + 1

def scrape_forever_league_rankings():
    """Scrape Half PPR Superflex rankings with enhanced tier extraction"""
    print("🏈 Scraping Half PPR Superflex rankings (Enhanced V3 with Tier Fix)...")
    
    scraper = FantasyProsSeleniumV3(headless=True)
    result = scraper.scrape_superflex_rankings('half_ppr')
    
    return result

if __name__ == "__main__":
    result = scrape_forever_league_rankings()
    
    if result is not None:
        print(f"\n🎉 Scraping completed successfully!")
    else:
        print(f"\n💥 Scraping failed. Check the error messages above.")
