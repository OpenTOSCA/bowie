## Angular BPMN for Winery
This angular project allows to model (customized) BPMN 2.0 plans for the [Winery](https://github.com/OpenTOSCA/winery). Also the project allows to visualize BPEL plans by rewriting the BPEL constructs into BPMN components. 

# Why you should use this project?

- easy to use
- customize your workflows
- extensible
- saves time


# Installation
There are various ways to install this modeler.

####  **NPM** - A nodejs based package manager.
To run this project with live-reload etc: 
 
    npm install
    ng serve --port 4242 
    
Then look at http://localhost:4242. 

####  **Docker** 
To run this project with docker:

    docker build -t angularmodeler .
    docker run -p 4242:80 angularmodeler

Then look at http://localhost:4242.

# Establish connection 

1) Navigate in the Winery to the `Administration` tab and select `Configuration` (if locally started it should be http://localhost:8080/#/admin/configuration)
2) Save the corresponding URL (in our case it's http://localhost:4242 but feel free to change it)

for more details: [setup](./src/docs/Setup.md)

# Features

- Docker
- save BPMN plans
- customized tasks & data objects
- asynchronous communication 
- dynamic properties panel & extension elements
- custom meta model to allow execution
- visualize BPEL plans

# Project Structure

- `app/bpmn-js`: allows different rendering & colors for tasks
- `app/model`: contains the structures for different constructs (e.g. nodetemplate..)
- `app/props-provider`: 

  -`CustomPropsProvider`: responsible for new tabs allows the user to set/edit properties of individual tasks
  
  -`CustomPaletteProvider`: 
  
    - defines tasks & data objects for the palette
    - defines which extension elements already exists
- `app/services`: responsible for the connection to the winery (see github/winery)
- `app/util`: contains the http features
- `assets`: contains the initial bpmn diagram & groovy scripts
- `docs`:
  - contains the moddle extension to define new attributes which are compatible with the Camunda Engine
  - contains helpful explanation how the tasks works, how to connect to the winery...
       
