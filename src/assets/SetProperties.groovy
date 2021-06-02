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
//def values = execution.getVariable("Values").split(",");
//
def propertiesNames = execution.getVariableNames();
println "propertiesNames"
println properties
for(int i in 0..properties.size()-1){
    if(properties[i].startsWith('Input_')){
        properties[i] = properties[i].split('Input_')[1];
    }
}
def nodeInstance = execution.getVariable("NodeInstanceURL");
for(int j in 0..properties.size()-1){
    for(int i in 0..propertiesNames.size()-1){
        if(propertiesNames[i].startsWith(nodeInstance) && !propertiesNames[i].endsWith(nodeInstance)){
            def temp = propertiesNames[i].split(nodeInstance)[1];
            println temp;
            if(temp == properties[j]){
              def value = execution.getVariable('Input_'+temp);
              execution.setVariable(nodeInstance+properties[j], value);
            }
        }
    }
}
           


def xml = new XmlSlurper().parseText(get.getInputStream().getText());
println xml;
println properties;
properties.eachWithIndex { property, index ->
    xml.'**'.findAll { if(it.name() == property) it.replaceBody execution.getVariable('Input_'+property) }
}
println "das sind die Properties";
println properties;
println "XML"
println xml.getClass();
println xml;
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