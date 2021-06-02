import groovy.json.*

def template = execution.getVariable("RelationshipTemplate");
def sourceUrlVar = execution.getVariable("SourceURL");
def sourceUrl = sourceUrlVar.substring(sourceUrlVar.lastIndexOf('/') + 1);
def targetUrlVar = execution.getVariable("TargetURL");
def targetUrl = targetUrlVar.substring(targetUrlVar.lastIndexOf('/') + 1);

println 'sourceUrl: ' + sourceUrl
println 'targetUrl: ' + targetUrl

// create TemplateInstance URL from instance data API URL
def url = execution.getVariable("instanceDataAPIUrl").minus("instances");
url = url + "relationshiptemplates/" + template + "/instances"
def post = new URL(url).openConnection();

// get ServiceTemplateInstance ID and add it to the request body
def serviceInstanceURL = execution.getVariable("ServiceInstanceURL");
def serviceInstanceID = serviceInstanceURL.split("/")[serviceInstanceURL.split("/").length-1];
def message = '<api:CreateRelationshipTemplateInstanceRequest xmlns:api="http://opentosca.org/api" service-instance-id="' + serviceInstanceID + '" source-instance-id="' + sourceUrl + '" target-instance-id="' + targetUrl + '"/>'
println "hier!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
println template
println serviceInstanceID

// send Post to instance data API
post.setRequestMethod("POST");
post.setDoOutput(true);
post.setRequestProperty("Content-Type", "application/xml")
post.setRequestProperty("accept", "application/json")
post.getOutputStream().write(message.getBytes("UTF-8"));

def status = post.getResponseCode();
println 'status relationshiptemplates ' + status
if(status == 200){
    def resultText = post.getInputStream().getText();    
    def slurper = new JsonSlurper();
    def json = slurper.parseText(resultText);
    return json;
}else{
    execution.setVariable("ErrorDescription", "Received status code " + status + " while creating Instance of RelationshipTemplate with ID: " + template);
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
}