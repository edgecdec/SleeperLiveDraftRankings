import requests
from bs4 import BeautifulSoup
import csv

from Rankings.Constants import YEAR_2024, HALF_PPR, FULL_PPR, STANDARD, CURRENT_YEAR, RANKINGS_OUTPUT_DIRECTORY

# The URL of the webpage containing the table
base_url = "https://www.thescore.com/news/"

THE_SCORE_ARTICLES_IDS = {
    YEAR_2024: {
        HALF_PPR: "2817340",
        FULL_PPR: "2835319",
        STANDARD: "2835315",
    }
}


def get_rankings_from_the_score(year, score_system=HALF_PPR):
    # Send a GET request to fetch the HTML content
    response = requests.get(f"{base_url}{THE_SCORE_ARTICLES_IDS[year][score_system]}")

    html_content = response.content

    # Parse the HTML content with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # Find the first table
    table = soup.find("table")

    # Extract table headers (if needed, but we'll define them manually)
    headers = ["Overall Rank", "Name", "Position", "Team", "Bye", "Position Rank", "Tier"]

    # Extract table rows and transform the data
    rows = []
    for tr in table.find_all("tr"):
        cells = tr.find_all("td")
        if len(cells) > 0:
            overall_rank = cells[0].get_text()  # Rk -> Overall Rank
            name = cells[1].get_text()  # Player -> Name
            team = cells[2].get_text()  # Team -> Team
            position = cells[3].get_text()  # Pos. -> Position
            bye = "-1"  # No data provided, set to -1
            position_rank = "-1"  # Set to -1
            tier = "-1"  # Set to -1

            row = [overall_rank, name, position, team, bye, position_rank, tier]
            rows.append(row)

    # Write to a CSV file
    csv_file = f"../../{RANKINGS_OUTPUT_DIRECTORY}/{score_system}_{year}_player_rankings.csv"
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)  # Write the headers
        writer.writerows(rows)  # Write the transformed data

    print(f"Data has been written to {csv_file}")


for scoring_type, article_id in THE_SCORE_ARTICLES_IDS[CURRENT_YEAR].items():
    get_rankings_from_the_score(CURRENT_YEAR, scoring_type)
