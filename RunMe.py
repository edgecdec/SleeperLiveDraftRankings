### RUN THIS FILE WHEN IT IS YOUR TURN TO PICK TO SEE WHO YOU SHOULD PICK

from Rankings.BestAvailable import printBestAvailable
from IPython.display import clear_output
import time

# How often (in seconds) the draft ranker will refresh
REFRESH_TIME = 30

# The program will refresh your draft this many times before automatically stopping
# (you can re-run if your draft is longer)
REFRESH_COUNT = 240

for i in range(REFRESH_COUNT):
    clear_output()
    printBestAvailable()
    time.sleep(REFRESH_TIME)
