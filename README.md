# SleeperLiveDraftRankings
### See what players you have ranked highest remaining in your draft.

## Build Your Rankings
1) Go to [this cheatsheet creation website](https://www.cheatsheetking.com/Cheatsheets/Edit)
2) Modify the 'top 200' list to your liking
3) When finished, click the 'export' button

## Run the Code (You can test this on mock drafts)
1) Put your csv in the same directory as this file (or replace the example csv file)
2) Go to EditMe.py and change the 'DRAFT_ID' to be the ID of your draft in browser.
3) Change the name of the CSV file if applicable


### Notes
1) This works on mock drafts, so I recommend trying it there first
    1) [Example mock draft](https://sleeper.com/draft/nfl/871324733034102784) that the code runs on before being edited
2) Does not currently support DST (they will be skipped but shouldn't break the code)
3) If you created your own csv file or get it from another site, you will need to rename your columns to match the first 4 columns in the example csv ('Overall Rank', 'Name', 'Team', 'Position')
    1) All other column names will be ignored, so if there are extras that is fine
4) You may need to install pandas with pip (for help see [this](https://www.google.com/search?q=install+pandas+with+pip&oq=install+pandas+with+pip&aqs=chrome..69i57.4908j0j4&sourceid=chrome&ie=UTF-8))
