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
    def message2 = execution.getVariable("State");
    println "DAS IST DER STATE";
    println message2;
    def url2 = json;
    println "InstanceURL SetState";
    println url2;
    def put = new URL(url2 + "/state").openConnection();
    put.setRequestMethod("PUT");
    put.setDoOutput(true);
    put.setRequestProperty("Content-Type", "text/plain")
    put.getOutputStream().write(message2.getBytes("UTF-8"));

    def status2 = put.getResponseCode();
    if(status2 != 200){
        execution.setVariable("ErrorDescription", "Received status code " + status2 + " while updating state of Instance with URL: " + url);
        throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
    }
    return json;
}else{
    execution.setVariable("ErrorDescription", "Received status code " + status + " while creating ServiceTemplateInstance!");
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
}