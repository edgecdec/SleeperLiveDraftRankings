from Rankings.ParseRankings import parseCSV
from Rankings.RankingsUtil import *
from Rankings.Constants import *
from EditMe import *

def printBestAvailable(fileName=FILE_NAME, draftID=DRAFT_ID):
    playerRankings = parseCSV(fileName)
    playersDrafted = getPlayersDrafted(draftID)


    for i in range(len(playerRankings) - 1, -1, -1):
        for item in playersDrafted:
            # print(item)
            # print(theScoreTop200[i])
            if item == playerRankings[i]:
                playerRankings.remove(item)
                break

    # BY POSITION RANKINGS
    printTopXPlayersForPositions([POS_QB], playerRankings, 5)
    printTopXPlayersForPositions([POS_RB], playerRankings, 5)
    printTopXPlayersForPositions([POS_WR], playerRankings, 5)
    printTopXPlayersForPositions([POS_TE], playerRankings, 5)
    printTopXPlayersForPositions([POS_K], playerRankings, 5)

    # FLEX RANKINGS
    printTopXPlayersForPositions([POS_RB, POS_WR, POS_TE], playerRankings, 10)

    #ALL RANKINGS
    printTopXPlayersForPositions([POS_QB, POS_RB, POS_WR, POS_TE, POS_K], playerRankings, 10)
