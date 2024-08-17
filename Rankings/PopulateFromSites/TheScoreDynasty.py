import requests
from bs4 import BeautifulSoup
import csv

from Rankings.Constants import POS_QB, POS_TE, RANKINGS_OUTPUT_DIRECTORY, YEAR_2024, MONTH_AUGUST
from SiteConstants import THE_SCORE_DYNASTY_ARTICLE_IDS

# Set the URL of the webpage containing the table
base_url = 'https://www.thescore.com/news'


def get_rankings_from_the_score(year, month, superFlex=False, tePrem=False):
    rows = []
    for cur_position, position_article_id in THE_SCORE_DYNASTY_ARTICLE_IDS[year][month].items():
        # Send a GET request to fetch the HTML content
        response = requests.get(f"{base_url}/{position_article_id}")

        html_content = response.content

        # Parse the HTML content with BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")

        # Find the first table
        table = soup.find("table")

        # Extract table headers (if needed, but we'll define them manually)
        headers = ["Overall Rank", "Name", "Position", "Team", "Bye", "Position Rank", "Tier"]

        # Extract table rows and transform the data
        for tr in table.find_all("tr"):
            cells = tr.find_all("td")
            if len(cells) > 0:
                overall_rank = int(cells[2].get_text())  # Value -> Overall Rank
                if (cur_position == POS_QB and superFlex) or (cur_position == POS_TE and tePrem):
                    overall_rank = int(cells[3].get_text())  # Value -> Overall Rank
                name = cells[1].get_text()  # Player -> Name
                position = cur_position  # Set to current position
                team = "N/A"  # No data provided
                bye = "-1"  # No data provided, set to -1
                position_rank = cells[0].get_text().strip()  # Rk -> Position Rank
                tier = "-1"  # Set to -1

                row = [overall_rank, name, position, team, bye, position_rank, tier]
                rows.append(row)

    rows.sort(key=lambda x: x[0], reverse=True)
    # Write to a CSV file
    csv_file = f"../../{RANKINGS_OUTPUT_DIRECTORY}/{month}_{year}_the_score_dynasty_player_rankings.csv"
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)  # Write the headers
        writer.writerows(rows)  # Write the transformed data

    print(f"Data has been written to {csv_file}")


get_rankings_from_the_score(YEAR_2024, MONTH_AUGUST)
