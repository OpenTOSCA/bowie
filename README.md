## Angular BPMN for Winery
Unser wunderschönes HiWi-Projekt.


# Documentation


To run this project with live-reload etc: 
 
    npm install
    ng serve --port 4242 
    
Then look at http://localhost:4242. 


To run this project with docker:

    docker build -t angularmodeler .
    docker run -p 4242:80 angularmodeler

Then look at http://localhost:4242.

# Features / Status

- Starten mit Docker
- Laden von Diagrammen
- Speichern von Diagrammen


# To Do

-  Dockerfile noch anpassen (docker rise)
-  vielleicht den Load Button später entfernen
-  den Save Button in der Palette fürs Erste ignorieren

Phase 3:
- Node Management Task hinzufügen (siehe Präsentation & SITCOM)
