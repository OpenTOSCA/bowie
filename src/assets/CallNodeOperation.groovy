import groovy.json.*

def csarID = execution.getVariable("CsarID");
def serviceTemplateID = execution.getVariable("ServiceTemplateID");
def serviceInstanceID = execution.getVariable("ServiceInstanceID");
def ip = serviceInstanceID.substring(7).split("/")[0].split(":")[0];
def nodeTemplateID = execution.getVariable("NodeTemplate");
def nodeInterface = execution.getVariable("Interface");
def operation = execution.getVariable("Operation");
def inputParamNames = execution.getVariable("InputParamNames").split(",");
def inputParamValues = execution.getVariable("InputParamValues").split(",");
def outputParamNames = execution.getVariable("OutputParamNames").split(",");

if(inputParamNames.size() != inputParamValues.size()){
    execution.setVariable("ErrorDescription", "Number of parameter names and values is not equal: " + inputParamNames.size() + " " + inputParamValues.size());
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidConfiguration");
}

def params = "";
if(inputParamNames.size() >0){
    params = params + '{';
    inputParamNames.eachWithIndex { inputParamName, index ->
        params = params + '"' + inputParamName + '" : "' + inputParamValues[index] + '",';
    }
    params = params.minus(',') + '}';
}

def template = '{"invocation-information" : {"csarID" : "$csarID", "serviceTemplateID" : "$serviceTemplateID", "serviceInstanceID" : "$serviceInstanceID", "nodeTemplateID" : "$nodeTemplateID", "interface" : "$nodeInterface", "operation" : "$operation"} , "params" : $params}';
def binding = ["csarID":csarID, "serviceTemplateID":serviceTemplateID, "serviceInstanceID":serviceInstanceID, "nodeTemplateID":nodeTemplateID, "nodeInterface":nodeInterface, "operation":operation, "params":params];
def engine = new groovy.text.SimpleTemplateEngine();
def message = engine.createTemplate(template).make(binding).toString();

def url = "http://" + ip + ":8086/ManagementBus/v1/invoker"

def post = new URL(url).openConnection();
post.setRequestMethod("POST");
post.setDoOutput(true);
post.setRequestProperty("Content-Type", "application/xml")
post.setRequestProperty("accept", "application/xml")
post.getOutputStream().write(message.getBytes("UTF-8"));

def status = post.getResponseCode();
if(status != 202){
    execution.setVariable("ErrorDescription", "Received status code " + status + " while invoking interface: " + nodeInterface + " operation: " + operation + " on NodeTemplate with ID: " + nodeTemplateID);
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode"); 
}

def taskURL =  post.getHeaderField("Location");
while("true"){
    def get = new URL(taskURL).openConnection();
    if(get.getResponseCode() != 200){
        execution.setVariable("ErrorDescription", "Received status code " + status + " while polling for NodeTemplate operation result!");
        throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode"); 
    }
    def pollingResult = get.getInputStream().getText();    
    def slurper = new JsonSlurper();
    def pollingResultJSON = slurper.parseText(pollingResult);
    
    if(!pollingResultJSON.status.equals("PENDING")){
        def responseJSON = pollingResultJSON.response;
        outputParamNames.each{ outputParam ->
             execution.setVariable(outputParam, responseJSON.get(outputParam));
        }
        return;
    }
    
    sleep(10000);
}