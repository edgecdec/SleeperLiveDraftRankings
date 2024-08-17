import requests
from bs4 import BeautifulSoup
import pandas as pd

from Rankings.Constants import RANKINGS_OUTPUT_DIRECTORY

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time

# Path to your chromedriver (ensure it's installed)
chrome_driver_path = 'path_to_chromedriver'

# Setup the WebDriver
service = Service(chrome_driver_path)
driver = webdriver.Chrome(service=service)

# URL to scrape
url = 'https://www.fantasypros.com/nfl/rankings/half-point-ppr-cheatsheets.php'

# Open the webpage
driver.get(url)

# Wait for the page to load (you may need to adjust the sleep time)
time.sleep(5)

# Get the page source after JavaScript has rendered
page_source = driver.page_source

# Parse the page source with BeautifulSoup
soup = BeautifulSoup(page_source, 'html.parser')

# Close the WebDriver
driver.quit()

# print(soup)
print('table' in soup)
print('table' in page_source)

# Find the table by its ID
table = soup.find('script')
print(table)

# Initialize lists to store the extracted data
overall_ranks = []
names = []
positions = []
teams = []
byes = []
position_ranks = []
tiers = []

# Iterate over the rows in the table body
for row in table.find('tbody').find_all('tr', class_='player-row'):
    # Extract the required columns from each row
    overall_rank = row.find('td', class_='sticky-cell-one').text.strip()
    player_info = row.find('td', class_='player-cell__td')
    name = player_info.find('a').text.strip()
    team = player_info.find('span', class_='player-cell-team').text.strip().replace("(", "").replace(")", "")
    position = row.find_all('td')[3].text.strip()
    bye = row.find_all('td')[4].text.strip()

    # Append data to the lists
    overall_ranks.append(overall_rank)
    names.append(name)
    positions.append(position)
    teams.append(team)
    byes.append(bye)
    position_ranks.append(-1)  # As per your requirement, setting to -1
    tiers.append(-1)           # As per your requirement, setting to -1

# Create a DataFrame from the lists
df = pd.DataFrame({
    'Overall Rank': overall_ranks,
    'Name': names,
    'Position': positions,
    'Team': teams,
    'Bye': byes,
    'Position Rank': position_ranks,
    'Tier': tiers
})

# Save the DataFrame to a CSV file
df.to_csv(f'../../{RANKINGS_OUTPUT_DIRECTORY}/fantasy_football_rankings.csv', index=False)

print("Data scraped and saved to 'fantasy_football_rankings.csv'")
