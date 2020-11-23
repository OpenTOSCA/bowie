import groovy.xml.XmlUtil

def url = execution.getVariable("InstanceURL") + "/properties";
def get = new URL(url).openConnection();
get.setRequestProperty("accept", "application/xml")

def status = get.getResponseCode();
if(status != 200){
    execution.setVariable("ErrorDescription", "Received status code " + status + " while getting properties from instance with URL: " + url);
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
}

def properties = execution.getVariable("Properties").split(",");
def values = execution.getVariable("Values").split(",");

if(properties.size() != values.size()){
    execution.setVariable("ErrorDescription", "Number of properties to update and values is not equal!");
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidConfiguration");
}

def xml = new XmlSlurper().parseText(get.getInputStream().getText());
properties.eachWithIndex { property, index ->
    xml.'**'.findAll { if(it.name() == property) it.replaceBody values[index] }
}

def put = new URL(url).openConnection();
put.setRequestMethod("PUT");
put.setDoOutput(true);
put.setRequestProperty("Content-Type", "application/xml")
put.setRequestProperty("accept", "application/xml")
put.getOutputStream().write(XmlUtil.serialize(xml).getBytes("UTF-8"));

status = put.getResponseCode();
if(status != 200){
    execution.setVariable("ErrorDescription", "Received status code " + status + " while updating properties from instance with URL: " + url);
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
}