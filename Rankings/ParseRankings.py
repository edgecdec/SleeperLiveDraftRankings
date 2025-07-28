import pandas as pd
from Rankings.Constants import *
from Rankings.RankingsUtil import *
from Rankings.PlayerRankings import Player

def parseCSV(fileName):
    tempDataFrame = pd.read_csv(f'{fileName}')
    rankingsDict = tempDataFrame.to_dict(orient='records')
    # print(rankingsDict)
    playersList = []
    for player in rankingsDict:
        name = player[FIELD_NAME]
        pos = remove_numbers_from_string(player[FIELD_POSITION])
        team = player[FIELD_TEAM]
        rank = player[FIELD_OVERALL_RANK]
        tier = player.get(FIELD_TIER, 999)  # Get tier from CSV, default to 999 if not present
        # Include all positions including DST and D/ST
        playersList.append(Player(name, team, pos, rank, tier))
    return playersList
