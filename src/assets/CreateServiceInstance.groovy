import groovy.json.*

def post = new URL(execution.getVariable("instanceDataAPIUrl")).openConnection();
def message = '<correlationID xmlns="http://opentosca.org/api">' + execution.getVariable("CorrelationID") + '</correlationID>';
post.setRequestMethod("POST");
post.setDoOutput(true);
post.setRequestProperty("Content-Type", "application/xml")
post.setRequestProperty("accept", "application/json")
post.getOutputStream().write(message.getBytes("UTF-8"));

def status = post.getResponseCode();
if(status == 200){
    def resultText = post.getInputStream().getText();    
    def slurper = new JsonSlurper();
    def json = slurper.parseText(resultText);
    return json;
}else{
    execution.setVariable("ErrorDescription", "Received status code " + status + " while creating ServiceTemplateInstance!");
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
}