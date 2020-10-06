import {EntryFactory, IPropertiesProvider} from '../bpmn-js/bpmn-js';
import  {$, jQuery} from "jquery";
import { AppComponent } from '../app.component';
import { HttpService } from '../util/http.service';
import { Observable } from 'rxjs/Rx';
import { ToscaInterface } from '../model/toscaInterface';

/**
 * Eventuell muessen wir die Klasse umbauen, also wie damals mit group.entries.push
 * Problem ist derzeit, dass ich die Funktion von dieser Klasse nicht aufrufen kann, weil wir EntryFactory. machen und somit in dieser Klasse sind
 * Au\serdem ist der Zeitpunkt um die Daten zu holen nicht passend
 */
export class CustomPropsProvider implements IPropertiesProvider{

  static $inject = ['translate', 'bpmnPropertiesProvider'];
  
  

// Note that names of arguments must match injected modules, see InjectionNames.
  constructor(private translate, private bpmnPropertiesProvider, private httpService: HttpService) {
    var options = [];
                  var http = new XMLHttpRequest();
                  http.open("GET", "http://localhost:8080/winery/nodetypes/http%253A%252F%252Fopentosca.org%252Fnodetypes/MyTinyToDoDockerContainer/interfaces/", true);
                     http.send();
                  http.onreadystatechange=function(){
                 if(http.readyState == XMLHttpRequest.DONE){
                  alert(http.responseText);

                   }
                   console.log(http.responseText);
                  }
    //EntryFactory.loadNodeTemplateInterfaces('http://opentosca.org', 'OpenTOSCAToDoDockerContainer');
    /** 
    var http = new XMLHttpRequest();
    http.onreadystatechange=function(){
      if(http.readyState == XMLHttpRequest.DONE){
        alert(http.responseText);

      }
      console.log(http.responseText);
    http.open("GET", "test", true);
  http.send();}
  */
  }



  public loadNodeTemplateInterfaces(namespace: string, nodeType: string): Observable<ToscaInterface[]> {
    const url = 'nodetypes/' + this.encode(namespace)
        + '/' + this.encode(nodeType) + '/interfaces/';
        console.log('Interface')
    console.log(this.httpService.get(this.getFullUrl(url)));
    return this.httpService.get(this.getFullUrl(url));
}

private encode(param: string): string {
  return encodeURIComponent(encodeURIComponent(param));
}

private getFullUrl(relativePath: string) {
  return 'http://localhost:8080' + relativePath;
}
 
  getTabs(element) {
    return this.bpmnPropertiesProvider.getTabs(element)
      .concat({
        id: 'custom',
        label: this.translate('Custom'),
        groups: [
          {
            id: 'customText',
            label: this.translate('customText'),
            entries: [
              EntryFactory.textBox({     
                id: 'nodetemplate',
                label: this.translate('NodeTemplate'),
                modelProperty: 'NodeTemplate'
              }),
              EntryFactory.selectBox({
                id : 'interface',
                description : 'interface',
                label : 'Interface',
                selectOptions: function(element){ 
                  var options = [{name: 'Test', value: 'Test'},{name: 'Test1', value: 'Test1'}];
                  EntryFactory.loadNodeTemplateInterfaces('http://opentosca.org', 'OpenTOSCAToDoDockerContainer');
                  return options;},
                setControlValue: true,
                modelProperty : 'example'
              }),
              EntryFactory.selectBox({
                id : 'operation',
                description : 'Operation',
                label : 'Operation',
                selectOptions: function(element){ 
                  var options = [{name: 'Test', value: 'Test'},{name: 'Test1', value: 'Test1'}];
                  return options;},
                setControlValue: true,
                modelProperty : 'example'
              })

        ]}]
      })
  }
}
