from Rankings.ParseRankings import parseCSV
from Rankings.RankingsUtil import *
from Rankings.Constants import *
from EditMe import *

def printBestAvailable():
    playerRankings = parseCSV(FILE_NAME)
    playersDrafted = getPlayersDrafted(DRAFT_ID)


    for i in range(len(playerRankings) - 1, -1, -1):
        for item in playersDrafted:
            # print(item)
            # print(theScoreTop200[i])
            if item == playerRankings[i]:
                playerRankings.remove(item)
                break

    printTopXPlayersForPos(POS_QB, playerRankings, 5)
    printTopXPlayersForPos(POS_RB, playerRankings, 5)
    printTopXPlayersForPos(POS_WR, playerRankings, 5)
    printTopXPlayersForPos(POS_TE, playerRankings, 5)
    printTopXPlayersForPos(POS_K, playerRankings, 5)

    print("\nTop 10 Overall")
    for i in range(min(10, len(playerRankings))):
        print(playerRankings[i])
