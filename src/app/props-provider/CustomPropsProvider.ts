import { EntryFactory, IPropertiesProvider } from '../bpmn-js/bpmn-js';
import { $, jQuery } from "jquery";

import { Observable, pipe } from 'rxjs/Rx';
import { HttpService } from '../util/http.service';
import { ToscaInterface } from '../model/toscaInterface';
import { AppComponent } from '../app.component';
import { NodeTemplate } from '../model/nodetemplate';
import { map } from 'rxjs/internal/operators';
import { WineryService } from '../services/winery.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';



/**
 * 
 */
@Injectable()
export class CustomPropsProvider implements IPropertiesProvider {

  static $inject = ['translate', 'bpmnPropertiesProvider'];
  static options = [];
  static interfaces = [{name: 'none', value: 'none'}];
  static operations = [];
  static template = [{name: 'none', value: 'none'}];
  static winery2: WineryService;


  // Note that names of arguments must match injected modules, see InjectionNames.
  constructor(private translate, private bpmnPropertiesProvider, private httpService: HttpService, private winery: WineryService) {
    this.update2(CustomPropsProvider.options);
    //this.loadNodeTemplates('http://opentosca.org/servicetemplates', 'MyTinyToDo_Bare_Docker', CustomPropsProvider.template);
    const url = 'servicetemplates/' + this.encode('http://opentosca.org/servicetemplates')
      + '/' + this.encode('MyTinyToDo_Bare_Docker') + '/topologytemplate/';//this.loadNodeTemplateInterfaces('http://opentosca.org/nodetypes', 'http://opentosca.org/nodetypes', CustomPropsProvider.interfaces);



  }

  public async update2(selectOptions) {
    console.log(CustomPropsProvider.winery2);
    var template = await this.loadNodeTemplates(CustomPropsProvider.template);
    console.log(template);
    console.log("vor update 3");
    //var selectOptions2 = await this.update3(selectOptions);
    console.log("nach update 3");
    //console.log(selectOptions2);

    //CustomPropsProvider.options.concat(selectOptions2[0]);
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

  public async loadNodeTemplates(options) {
    if (CustomPropsProvider.winery2 != undefined) {
      CustomPropsProvider.winery2.loadNodeTemplates();
      var httpService = CustomPropsProvider.winery2.httpService;
      console.log('Service', httpService);
      const url = 'servicetemplates/' + this.encode('http://opentosca.org/servicetemplates')
        + '/' + this.encode('MyTinyToDo_Bare_Docker') + '/topologytemplate/';

      if (httpService != undefined) {
        return httpService.get(this.getFullUrl(url))
          .pipe(map(await this.transferResponse2NodeTemplate));
      }
    }
  }


  private transferResponse2NodeTemplate(response: any) {
    console.log("cHECK");
    console.log(response);

    const nodeTemplates: NodeTemplate[] = [];
    for (const key in response.nodeTemplates) {
      if (response.nodeTemplates.hasOwnProperty(key)) {
        const nodeTemplate = response.nodeTemplates[key];
        CustomPropsProvider.template.concat({ value: nodeTemplate.id, name: nodeTemplate.id });

        nodeTemplates.push(new NodeTemplate(
          nodeTemplate.id,
          nodeTemplate.name,
          nodeTemplate.type,
          nodeTemplate.type.replace(/^\{(.+)\}(.+)/, '$1')));
      }
    }

    return nodeTemplates;
  }

  public encode(param: string): string {
    return encodeURIComponent(encodeURIComponent(param));
  }

  private getFullUrl(relativePath: string) {
    return 'http://localhost:8080' + relativePath;
  }

  getTabs(element) {
    this.update2(CustomPropsProvider.options);
    return this.bpmnPropertiesProvider.getTabs(element)
      .concat({
        id: 'custom',
        label: this.translate('Properties'),
        groups: [
          {
            id: 'opProp',
            label: this.translate('OperationTask Properties'),
            entries: [
              EntryFactory.textBox({
                id: 'servicetemplateID',
                description: 'ServiceTemplate ID',
                label: 'Service Template ID',
                modelProperty: 'servicetemplateID'
              }),
              EntryFactory.selectBox({
                id: 'NodeTemplate',
                description: 'NodeTemplate',
                label: 'NodeTemplate',
                selectOptions: function (element, values) {
                  //console.log(CustomPropsProvider.template);
                  
                  return CustomPropsProvider.template;
                },
                setControlValue: true,
                modelProperty: 'NodeTemplate',
                set: function (element, values, node) {
                  console.log("das ausgewählte Element ist");
                  console.log(values.nodetemplate);
                  console.log(element);
                  element.businessObject.$attrs.interface = [];
                  if (values.NodeTemplate != undefined ) {
                    var namespace = 'http://opentosca.org/nodetypes';
                    const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                      + '/' + encodeURIComponent(encodeURIComponent((values.NodeTemplate))) + '/interfaces/';
                    var interfaces = new Promise(resolve => {
                    
                      var http = new XMLHttpRequest();
                      http.open("GET", 'http://localhost:8080/' + 'winery/' + url, true);
                      http.send();
                      http.onreadystatechange = function () {
                        if (http.readyState == XMLHttpRequest.DONE) {

                          console.log(http.responseText);
                          var response = JSON.parse(http.responseText);
                          CustomPropsProvider.interfaces = [];
                          console.log('JSON PARSE');
                          console.log(response);
                          var array = [];
                          for (var i = 0; i < response.length; i++) {
                            array.push({
                              name: response[i].name, value: response[i].name
                            });
                            CustomPropsProvider.interfaces.push({
                              name: response[i].name, value: response[i].name
                            })
                            console.log('HIER Array');
                            console.log(array);
                            window['interfaceN'] = array ;
                          }
                          
                          console.log(CustomPropsProvider.interfaces);
                          element.businessObject.$attrs.interface = CustomPropsProvider.interfaces;
                          console.log(element);
                          resolve(CustomPropsProvider.interfaces);
                        }

                      }
                    }).then(response => { return response })
                    element.businessObject.$attrs.NodeTemplate = values.NodeTemplate;
                    return;
                  }
                  return;
                }
              }),
              EntryFactory.selectBox({
                id: 'interface',
                description: 'Interface',
                label: 'Interface',
                selectOptions: function (element, values) {
                  console.log('SELECTOPTIONS')
                  if (element.businessObject.$attrs.nodetemplate != undefined) {
                    var namespace = 'http://opentosca.org/nodetypes';
                    const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                      + '/' + encodeURIComponent(encodeURIComponent((element.businessObject.$attrs.nodetemplate))) + '/interfaces/';
                    var interfaces = new Promise(resolve => {
                      var http = new XMLHttpRequest();
                      http.open("GET", 'http://localhost:8080/' + 'winery/' + url, true);
                      http.send();
                      http.onreadystatechange = function () {
                        if (http.readyState == XMLHttpRequest.DONE) {

                          console.log(http.responseText);
                          var response = JSON.parse(http.responseText);
                          CustomPropsProvider.interfaces = [];
                          console.log('JSON PARSE');
                          console.log(response);
                          var array = [];
                          for (var i = 0; i < response.length; i++) {
                            array.push({
                              name: response[i].name, value: response[i].name
                            });
                            CustomPropsProvider.interfaces.push({
                              name: response[i].name, value: response[i].name
                            })
                            console.log('HIER Array');
                            console.log(array);
                            window['interfaceN'] = array ;


                          }
                          console.log(CustomPropsProvider.interfaces);
                          //element.businessObject.$attrs.interface = CustomPropsProvider.interfaces;
                          console.log(element);
                          resolve(CustomPropsProvider.interfaces);
                        }

                      }
                    }).then(response => { return response })
                    //element.businessObject.$attrs.nodetemplate = values.nodetemplate;
                    console.log(window['interfaceN']);
                    return window['interfaceN'];
                  }
                  console.log(window['interfaceN']);
                  return window['interfaceN'];
                
                },
                setControlValue: true,
                modelProperty: 'interface'
              }),
              EntryFactory.selectBox({
                id: 'operation',
                description: 'Operation',
                label: 'Operation',
                selectOptions: function (element) {
                  var options = [{ name: 'Test', value: 'Test' }, { name: 'Test1', value: 'Test1' }];
                  return CustomPropsProvider.operations;
                },
                setControlValue: true,
                modelProperty: 'operation'
              }),
              EntryFactory.selectBox({
                id: 'inputParams',
                description: 'Input Parameter',
                label: 'Input Parameter',
                selectOptions: function (element) {
                  return CustomPropsProvider.options;
                },
                set: function (element, values, node) {
                  if (values.inputParams != undefined) {
                    element.businessObject.$attrs.nameInput = values.inputParams;
                    element.businessObject.$attrs.inputParams = values.inputParams;
                    return;
                  }
                  return;
                },
                setControlValue: true,
                modelProperty: 'inputParams'
              }),
              EntryFactory.textField({
                id: 'nameInput',
                description: 'Name of Parameter',
                label: 'Name of Parameter',
                modelProperty: 'nameInput',
                validate: function (element, values) {
                  var errorMessageP = {};
                  if (element.businessObject.$attrs.inputParams != undefined) {
                    element.businessObject.$attrs.nameInput = element.businessObject.$attrs.inputParams;
                    return errorMessageP;

                  } else {
                    errorMessageP = "Please select an input parameter.";
                    return errorMessageP;
                  }
                }
              }),
              EntryFactory.textField({
                id: 'typeInput',
                description: 'Type of Parameter',
                label: 'Type of Parameter',
                modelProperty: 'typeInput',
                validate: function (element, values) {
                  var errorMessageP = {};
                  if (element.businessObject.$attrs.inputParams != undefined) {
                    element.businessObject.$attrs.typeInput = element.businessObject.$attrs.inputParams;
                    return errorMessageP;
                  } else {
                    errorMessageP = "Please select an input parameter.";
                    return errorMessageP;
                  }
                }
              }),
              EntryFactory.textField({
                id: 'valueInput',
                description: 'Value of Parameter',
                label: 'Value of Parameter',
                modelProperty: 'valueInput'
              }),
              EntryFactory.selectBox({
                id: 'outputParams',
                description: 'Output Parameter',
                label: 'Output Parameter',
                selectOptions: function (element) {
                  var options = [{ name: 'Test', value: 'Test' }, { name: 'Test1', value: 'Test1' }];
                  return options;
                },
                setControlValue: true,
                modelProperty: 'outputParams'
              })

            ]
          }]
      })
  }
}
