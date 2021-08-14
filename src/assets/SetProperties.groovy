import groovy.xml.XmlUtil
def message2 = execution.getVariable("State");
println message2;
def nodeInstance = execution.getVariable("NodeInstanceURL");
def nodeInstanceURL = execution.getVariable(nodeInstance); 
def url = nodeInstanceURL + "/properties";
def get = new URL(url).openConnection();
get.setRequestProperty("accept", "application/xml")

def status = get.getResponseCode();
if(status != 200){
    execution.setVariable("ErrorDescription", "Received status code " + status + " while getting properties from instance with URL: " + url);
    throw new org.camunda.bpm.engine.delegate.BpmnError("InvalidStatusCode");
}

def properties = execution.getVariableNames();
//def values = execution.getVariable("Values").split(",");
//
def propertiesNames = execution.getVariableNames();
println "propertiesNames"
println properties
def newProperties = properties;
//for(int i in 0..properties.size()-1){
  //  if(properties[i].startsWith('Input_')){
    //    newProperties[i] = properties[i].split('Input_')[1];
    //}
//}
println properties;

println nodeInstance;
println propertiesNames;

println "Properties";
println properties;

println "PropertiesNames";
println propertiesNames;

for(int j in 0..properties.size()-1){
    for(int i in 0..propertiesNames.size()-1){
        println "aktuell";
        println propertiesNames[i];
        println "nodeinstance";
        println nodeInstance;
        println propertiesNames[i].startsWith(nodeInstance);
        println !propertiesNames[i].endsWith(nodeInstance);
        if(propertiesNames[i].startsWith(nodeInstance) && !propertiesNames[i].endsWith(nodeInstance)){
            print propertiesNames[i];
            def temp = propertiesNames[i].split(nodeInstance)[1];
            println "das ist temp";
            println temp;
            println properties[j];
            if(temp == properties[j]){
                print "value";
                
              def value = execution.getVariable('Input_'+temp);
              print value;
              if(value.contains('->')){
                  def port = value.split('->')[1];
                  value = port;
              }
              execution.setVariable(nodeInstance+properties[j], value);
            }
        }
    }
}
println "HIER";   


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