import requests
from Rankings.PlayerRankings import Player

def printTopXPlayersForPos(pos, playerRankings, count=5):
    print(f"\nTop {count} {pos}s")
    i = 0
    posCount = 0
    while posCount < count and i < len(playerRankings):
        # print(playerRankings[i].pos)
        if playerRankings[i].pos == pos:
            print(playerRankings[i])
            posCount += 1
        i += 1


def getNameFromMetaData(metadata):
    return f"{metadata['first_name']} {metadata['last_name']}"


def getPlayersDrafted(draftID):
    draftData = requests.get(f"https://api.sleeper.app/v1/draft/{draftID}/picks").json()

    playersDrafted = []
    for item in draftData:
        metadata = item['metadata']
        name = getNameFromMetaData(metadata)
        team = metadata['team']
        pos = metadata['position']
        playersDrafted.append(Player(name, team, pos, -1))

    return playersDrafted