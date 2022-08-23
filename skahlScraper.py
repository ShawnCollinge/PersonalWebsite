import time, os, sys, requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import pandas as pd
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
load_dotenv()

SEASON =  sys.argv[1]
GAME_DURATION = "1:30"
TYPE = "GAME"
GAME_TYPE = sys.argv[2]
TEAM = "2609"

URL = f"https://api.codetabs.com/v1/proxy/?quest=https://snokinghockeyleague.com/api/game/list/{SEASON}/0/{TEAM}"

options = Options()
options.headless = True
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
response = requests.get(URL)

schedule = response.json()

fileName = f"{TEAM}.csv"

gameSchedule = {
                "Type": {},
                "Game Type": {},
                "Title": {},
                "Home": {},
                "Away": {},
                "Date": {}, 
                "Time": {},
                "Duration": {},
                "Location": {},
                }
                
today = datetime.now()
for i in range(len(schedule)):
    game = schedule[i]
    date = datetime.strptime(game['date'], "%m/%d/%Y")
    #if date.date() > today.date():
    gameSchedule['Title'][i+1] = ""
    gameSchedule['Type'][i+1] = TYPE
    gameSchedule['Game Type'][i+1] = GAME_TYPE
    gameSchedule['Home'][i+1] = game['teamHomeName']
    gameSchedule['Away'][i+1] = game['teamAwayName']
    gameSchedule['Date'][i+1] = date.strftime("%d/%m/%Y")
    gameSchedule['Time'][i+1] = game['time']
    gameSchedule['Duration'][i+1] = GAME_DURATION
    gameSchedule['Location'][i+1] = game['rinkName']

df = pd.DataFrame(gameSchedule)
df.to_csv(fileName, index=False)


driver.get("https://www.benchapp.com/schedule/import")
driver.find_element(By.NAME, "email").send_keys(os.getenv('EMAIL'))
driver.find_element(By.NAME, "password").send_keys(os.getenv('PASSWORD'))
current_url = driver.current_url
driver.find_element(By.XPATH, "/html/body/div[1]/div[2]/div[1]/div/div[2]/div/form/div[3]/span/button").click()
WebDriverWait(driver, 30).until(EC.url_changes(current_url))
browse = driver.find_element(By.XPATH, "/html/body/div[1]/div[7]/section/div[2]/div/div/section/div[1]/div/div[2]/div/label/input")
browse.send_keys(f"{os.getcwd()}/{fileName}")
time.sleep(5)
driver.find_element(By.XPATH, "/html/body/div[1]/div[7]/section/div[2]/div/div/section/div[1]/div/div[3]/div[2]/div/div/div[3]/div/div[2]/button[2]/span").click()
time.sleep(5)
os.remove(fileName) 

driver.close()