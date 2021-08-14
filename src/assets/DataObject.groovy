def properties = execution.getVariableNames();
def nodeInstance = execution.getVariable("NodeInstanceURL");
def dataObject = execution.getVariable('DataObject');
// mappt dataobject auf nodeinstances
def nodeInstanceValue = execution.getVariable(nodeInstance);
println "das sind die Properties"
println properties;
for(int i in 0..properties.size()-1){
    if(properties[i].startsWith('Input_')){
        def property = properties[i];
        def value = execution.getVariable(property);
        property = property.split('_')[1];
        execution.setVariable(nodeInstance+property, value);
    }
}
execution.setVariable(dataObject,nodeInstance);
println "Resultat";
println execution.getVariables();