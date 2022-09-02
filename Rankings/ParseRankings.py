import pandas as pd
from Rankings.PlayerRankings import Player
from Rankings.Constants import *

def parseCSV(fileName):
    tempDataFrame = pd.read_csv(f'{fileName}')
    rankingsDict = tempDataFrame.to_dict(orient='records')
    # print(rankingsDict)
    playersList = []
    for player in rankingsDict:
        name = player[FIELD_NAME]
        pos = player[FIELD_POSITION]
        team = player[FIELD_TEAM]
        rank = player[FIELD_OVERALL_RANK]
        if pos not in ['DST', 'D/ST']:
            playersList.append(Player(name, team, pos, rank))
    return playersList