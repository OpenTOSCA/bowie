import { EntryFactory, IPropertiesProvider } from '../bpmn-js/bpmn-js';
import { $, jQuery } from "jquery";
import { HttpService } from '../util/http.service';
import { Observable } from 'rxjs/Rx';
import { ToscaInterface } from '../model/toscaInterface';
import { AppComponent } from '../app.component';
import { NodeTemplate } from '../model/nodetemplate';

/**
 * Eventuell muessen wir die Klasse umbauen, also wie damals mit group.entries.push
 * Problem ist derzeit, dass ich die Funktion von dieser Klasse nicht aufrufen kann, weil wir EntryFactory. machen und somit in dieser Klasse sind
 * Au\serdem ist der Zeitpunkt um die Daten zu holen nicht passend
 */
export class CustomPropsProvider implements IPropertiesProvider {

  static $inject = ['translate', 'bpmnPropertiesProvider'];
  static options = [{ name: 'Test', value: 'Test' }, { name: 'Test1', value: 'Test1' }];


  // Note that names of arguments must match injected modules, see InjectionNames.
  constructor(private translate, private bpmnPropertiesProvider, private httpService: HttpService) {
    this.update2(CustomPropsProvider.options);
  }

  public async update2(selectOptions) {
    console.log("vor update 3");
    var selectOptions2 = await this.update3(selectOptions);
    console.log("nach update 3");
    console.log(selectOptions2);

    CustomPropsProvider.options.concat(selectOptions2[0]);
    console.log(CustomPropsProvider.options);

  }
  public async update3(selectOptions) {

    return new Promise(resolve => {
      var http = new XMLHttpRequest();
      http.open("GET", "http://localhost:8080/winery/nodetypes/http%253A%252F%252Fopentosca.org%252Fnodetypes/MyTinyToDoDockerContainer/interfaces/", true);
      http.send();
      http.onreadystatechange = function () {
        if (http.readyState == XMLHttpRequest.DONE) {
          //alert(http.responseText);
          var si = JSON.parse(http.responseText);
          console.log(si[0].operation[0].inputParameters.inputParameter);
          var length = si[0].operation[0].inputParameters.inputParameter.length;
          var counter = 0; //test
          var containsParam = false;
          for (var i = 0; i < length; i++) {
            for (var j = 0; j < selectOptions.length; j++) {
              
              if (si[0].operation[0].inputParameters.inputParameter[i].name == selectOptions[j].name) {
                containsParam = true;
              }
            }
            if (!containsParam) {
              selectOptions.push({
                value: si[0].operation[0].inputParameters.inputParameter[i].name, name:
                  si[0].operation[0].inputParameters.inputParameter[i].name
              })
            }

          }
          resolve(selectOptions);


        }
      }
    }).then(response => { return response })// console.log("Got it", response)) 
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
    console.log(CustomPropsProvider.options);
    console.log("tabs");
    this.update2(CustomPropsProvider.options);
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
                id: 'interface',
                description: 'interface',
                label: 'Interface',
                selectOptions: function (element, values) {
                  var options = [{ name: 'Test', value: 'Test' }, { name: 'Test1', value: 'Test1' }];
                  
                  return options;
                },
                setControlValue: true,
                modelProperty: 'example'
              }),
              EntryFactory.selectBox({
                id: 'operation',
                description: 'Operation',
                label: 'Operation',
                selectOptions: function (element) {
                  var options = [{ name: 'Test', value: 'Test' }, { name: 'Test1', value: 'Test1' }];
                  return CustomPropsProvider.options;
                },
                setControlValue: true,
                modelProperty: 'example2'
              })

            ]
          }]
      })
  }
}
