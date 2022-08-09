import re, sys
from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

url = sys.argv[1]
firstName = sys.argv[2]
lastName = sys.argv[3]

name = f"{lastName}, {firstName}"
options = Options()
options.headless = True
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.get(url)
html = driver.page_source
MySoup = BeautifulSoup(html, "html.parser")
results = MySoup.find_all(name="a", class_="shooterLink")
theResult = "test"
for result in results:
    if name.lower() in result.getText().lower():
        theResult = result
        continue

ShooterID = theResult['shooterid']
results = MySoup.find(name="a", shooterid=ShooterID)
overallPlace = re.sub('\D', '', results.getText())
rawLastPlace = MySoup.find_all("a", class_="shooterLink")[-1]
lastPlace = re.sub('\D', '', rawLastPlace.getText())
overallPercent = results.find_next(name="td")
overallPoints = overallPercent.find_next(name="td")
division = overallPoints.find_next(name="td").find_next(name="td").find_next(name="td")

DivisionID = MySoup.find(name="option", text=division.getText())['value']

driver.get(f"{url}?q_division={DivisionID}")
html = driver.page_source
MySoup = BeautifulSoup(html, "html.parser")
results = MySoup.find(name="a", shooterid=ShooterID)
divisionPlace = re.sub('\D', '', results.getText())
rawLastPlace = MySoup.find_all("a", class_="shooterLink")[-1]
divisionLastPlace = re.sub('\D', '', rawLastPlace.getText())
divisionPercent = results.find_next(name="td")
divisionPoints = divisionPercent.find_next(name="td")
totalTime = divisionPoints.find_next(name="td")
percentOfPointsPossible = totalTime.find_next(name="td")
division = percentOfPointsPossible.find_next(name="td")
alphas = division.find_next(name="td").find_next("td").find_next("td").find_next("td").find_next("td")
charlies = alphas.find_next(name="td").find_next("td")
deltas = charlies.find_next(name="td")
mikes = deltas.find_next(name="td")
NoPM = mikes.find_next(name="td")
NoS = NoPM.find_next(name="td")
Proc = NoS.find_next(name="td")

print(f'''Overall Time {totalTime.getText()}
{divisionPlace}/{divisionLastPlace} {division.getText()} ({float(divisionPercent.getText()):.2f}%)
{overallPlace}/{lastPlace} Overall ({float(overallPercent.getText()):.2f}%)
A {alphas.getText()} C {charlies.getText()} D {deltas.getText()} M {mikes.getText()} NPM {NoPM.getText()} NS {NoS.getText()} PROC {Proc.getText()}
{round(float(divisionPoints.getText()))}/{round(float(divisionPoints.getText())/(float(percentOfPointsPossible.getText())/100))}
''')
print(" ")

StagesString = ""

driver.get(f"{url}?q_individual={ShooterID}&q_division=0")
html = driver.page_source
MySoup = BeautifulSoup(html, "html.parser")
divisionResults = MySoup.find_all(name="tr", class_="divisionRow")
results = MySoup.find_all(name="tr", class_="overallRow")
stagesParent = MySoup.find(name="div", id="editHistory")
stages = stagesParent.findChildren("h3")

driver.close()

for i in range(len(stages)):
    stageName = stages[i]
    startingPoint = results[i].find_next("td")
    video = startingPoint.find_next("td")
    place = video.find_next("td")
    percent = place.find_next("td")

    divisionStartingPoint = divisionResults[i].find_next("span")
    divisionPlace = divisionStartingPoint.find_next("td").find_next("td")
    divisionPercent = divisionPlace.find_next("td")
    divisionPoints = divisionPercent.find_next("td")
    hitFactor = divisionPoints.find_next("td").find_next("td")
    stageTime = hitFactor.find_next("td")
    powerFactor = stageTime.find_next("td").find_next("td").find_next("td").find_next("td")
    stageAlphas = powerFactor.find_next("td").find_next("td")
    stageCharlies = stageAlphas.find_next("td").find_next("td")
    stageDeltas = stageCharlies.find_next("td")
    stageMikes = stageDeltas.find_next("td")
    stageNPM = stageMikes.find_next("td")
    stageNS = stageNPM.find_next("td")
    stageProc = stageNS.find_next("td")
    
    if powerFactor.getText() == "MAJOR":
        charliePoints = 4
        deltaPoints = 2
    else: 
        charliePoints = 3
        deltaPoints = 1

    place = place.getText()
    if len(place.split()) > 1:
        place = place.split("-")[0]
    
    divisionPlace = divisionPlace.getText()
    if len(divisionPlace.split()) > 1:
        divisionPlace = divisionPlace.split("-")[0]

    totalPoints = int(stageAlphas.getText()) * 5 + int(stageCharlies.getText()) * charliePoints + int(stageDeltas.getText()) * deltaPoints - int(stageMikes.getText()) * 10 - int(stageNS.getText()) * 10 - int(stageProc.getText()) * 10
    if totalPoints < 0:
        totalPoints = 0

    totalPointsPerStage = int(stageAlphas.getText()) + int(stageCharlies.getText()) + int(stageDeltas.getText()) + int(stageMikes.getText())
    totalPointsPerStage *= 5
    if (totalPointsPerStage == 0):
        totalPointsPerStage = 1
    stagePercentOfTotal = round(totalPoints/totalPointsPerStage * 100,2)

    print(f'''
{stageName.getText()}
{divisionPlace.strip()}/{divisionLastPlace} {division.getText()} ({float(divisionPercent.getText()):.2f}%)
{place.strip()}/{lastPlace} Overall ({float(percent.getText()):.2f}%)
Time {stageTime.getText()}, HF {float(hitFactor.getText()):.4f}
A {stageAlphas.getText()} C {stageCharlies.getText()} D {stageDeltas.getText()} M {stageMikes.getText()} NPM {stageNPM.getText()} NS {stageNS.getText()} PROC {stageProc.getText()}
{totalPoints}/{totalPointsPerStage} ({float(stagePercentOfTotal):.2f}%)''')
    print(" ")

sys.stdout.flush()