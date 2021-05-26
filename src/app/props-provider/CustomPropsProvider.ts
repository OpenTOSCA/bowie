import { EntryFactory, IPropertiesProvider, CreateHelper, BpmnFactory} from '../bpmn-js/bpmn-js';
import _camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";
import { $, jQuery } from "jquery";
import BpmnModdle from 'bpmn-moddle';
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
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { ElementHelper } from '../bpmn-js/ElementHelper.js';
import { isFactory } from '@angular/core/src/render3/interfaces/injector';
import { temporaryAllocator } from '@angular/compiler/src/render3/view/util';



/**
 * 
 */
@Injectable()
export class CustomPropsProvider implements IPropertiesProvider {

  static $inject = ['translate', 'bpmnPropertiesProvider'];
  static options = [];
  static outputParam = [];
  static interfaces = [{ name: 'none', value: 'none' }];
  static operations = [];
  static template = [{ name: 'none', value: 'none' }];
  static winery2: WineryService;
  static tosca = [];
  static opt = [{ name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
  { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
  { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
  static types  = [{name: 'none', value: 'none'}, {name: 'VALUE', value: 'VALUE' }, { name: 'String', value: 'String' }, { name: 'DA', value: 'DA' }];
  static DA =[{ name: 'none', value: 'none' }];
  static moddle = new BpmnModdle({ camunda: _camundaModdleDescriptor });
  static properties =[];
  // Note that names of arguments must match injected modules, see InjectionNames.
  constructor(private translate, private bpmnPropertiesProvider, private httpService: HttpService, private winery: WineryService) {
    this.update2(CustomPropsProvider.options);
    //this.loadNodeTemplates('http://opentosca.org/servicetemplates', 'MyTinyToDo_Bare_Docker', CustomPropsProvider.template);
    //const url = 'servicetemplates/' + this.encode('http://opentosca.org/servicetemplates')
    //  + '/' + this.encode(CustomPropsProvider.winery2.serviceTemplateId) + '/topologytemplate/';//this.loadNodeTemplateInterfaces('http://opentosca.org/nodetypes', 'http://opentosca.org/nodetypes', CustomPropsProvider.interfaces);



  }

  public async update2(selectOptions) {
    console.log(CustomPropsProvider.winery2);
    var template = await this.loadNodeTemplates(CustomPropsProvider.template);
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

    if (element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('Data Object Properties'),
              entries: [
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  //description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'qa:servicetemplateID',
                }),
                EntryFactory.selectBox({
                  id: 'NodeTemplate',
                  //description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    return CustomPropsProvider.template;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    console.log("das ausgewählte Element ist");
                    var arr = element.businessObject.extensionElements;
                    let moddle = new BpmnModdle();
                    console.log(moddle);
                    
                    //moddle.values[0].inputParameters.push(moddle.values[0].inputParameters[0])
                    console.log(moddle);
                    
                    //CreateHelper.createInputParameter('', 'Test', BpmnFactory);
                    //console.log(arr.values[0].inputParamters[moddle.create()]);
                    if (values['qa:NodeTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                      
                      console.log(element);
                      element.businessObject.$attrs['qa:interface'] = [];
                      element.businessObject.$attrs['qa:operation'] = [];
                      if (values['qa:NodeTemplate'] != undefined) {
                        var nodetemplate = values['qa:NodeTemplate'].split('_')[0];
                        console.log(nodetemplate);
                        var namespace = 'http://opentosca.org/nodetypes';
                        const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                          + '/' + encodeURIComponent(encodeURIComponent((nodetemplate))) + '/interfaces/';
                        console.log(url)
                        var interfaces = new Promise(resolve => {

                          var http = new XMLHttpRequest();
                          console.log('http://localhost:8080/' + 'winery/' + url);
                          http.open("GET", 'http://localhost:8080/' + 'winery/' + url, true);
                          http.send();
                          http.onreadystatechange = function () {
                            if (http.readyState == XMLHttpRequest.DONE) {
console.log('http://localhost:8080/' + 'winery/' + url);
                              console.log(http.responseText);
                              var response = JSON.parse(http.responseText);
                              CustomPropsProvider.interfaces = [];
                              console.log('JSON PARSE');
                              console.log(response);
                              var array = [];

                              for (var i = 0; i < response.length; i++) {
                                CustomPropsProvider.tosca.push({ name: response[i].name, value: response[i].operation });
                                array.push({
                                  name: response[i].name, value: response[i].name
                                });
                                CustomPropsProvider.interfaces.push({
                                  name: response[i].name, value: response[i].name
                                })

                                window['interfaceN'] = array;
                              }
                              element.businessObject.$attrs['qa:interface'] = CustomPropsProvider.interfaces;
                              resolve(CustomPropsProvider.interfaces);
                            }

                          }
                        }).then(response => {
                          return response
                        })
                        element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];

                        //inputtests
                        if (is(element.businessObject, 'bpmn:ScriptTask')) {
                          if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                            element.businessObject.extensionElements.values[0].inputParameters[3].value = values['qa:NodeTemplate'];
                          } else if (element.businessObject.$attrs['qa:ntype'] === "NodeInstance") {
                            element.businessObject.extensionElements.values[0].inputParameters[0].value = values['qa:NodeTemplate'];
                          }
                        }
                        //
                        return;
                      }
                    }
                    return;
                  }, 
                }),
                EntryFactory.selectBox({
                  id: 'interface',
                  //description: 'Interface',
                  label: 'Interface',
                  selectOptions: function (element, values) {

                    if (element.businessObject.$attrs['qa:NodeTemplate'] != undefined) {
                      var namespace = 'http://opentosca.org/nodetypes';
                      var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate'].split('_')[0];
                      const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                        + '/' + encodeURIComponent(encodeURIComponent((nodetemplate))) + '/interfaces/';
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
                            //CustomPropsProvider.tosca = [];
                            for (var i = 0; i < response.length; i++) {
                              array.push({
                                name: response[i].name, value: response[i].name
                              });
                              CustomPropsProvider.interfaces.push({
                                name: response[i].name, value: response[i].name
                              });
                              window['interfaceN'] = array;

                            }
                            resolve(CustomPropsProvider.interfaces);
                          }

                        }
                      }).then(response => {
                        return CustomPropsProvider.interfaces
                      })
                      //element.businessObject.$attrs.nodetemplate = values.nodetemplate;
                      console.log(window['interfaceN']);
                      return CustomPropsProvider.interfaces;
                    }
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:interface'] = values['qa:interface'];
                    //inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[4].value = values['qa:interface'];
                      }
                    }
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {

                          var arr = [];
                          for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                            CustomPropsProvider.operations.push({
                              name: CustomPropsProvider.tosca[i].value[j].name, value:
                                CustomPropsProvider.tosca[i].value[j].name
                            });
                          }

                          element.businessObject.$attrs['qa:operation'] = values['qa:operation'];
                          return;
                        }
                      }
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'qa:interface'
                }),
                EntryFactory.selectBox({
                  id: 'operation',
                  //description: 'Operation',
                  label: 'Operation',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.operations = [];
                          var arr = [];
                          CustomPropsProvider.operations.push({ name: 'none', value: 'none' });
                          for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                            CustomPropsProvider.operations.push({
                              name: CustomPropsProvider.tosca[i].value[j].name, value:
                                CustomPropsProvider.tosca[i].value[j].name
                            });
                          }
                          //console.log(CustomPropsProvider.operations);

                          //element.businessObject.$attrs.operation = values.operations;

                          return CustomPropsProvider.operations;
                        }
                      }

                    }
                    return CustomPropsProvider.operations;
                  }, set: function (element, values, node) {
                    console.log(values['qa:operation']);
                    element.businessObject.$attrs['qa:operation'] = values['qa:operation'];
                    //inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[5].value = values['qa:operation'];
                      }
                    }
                    console.log(element);
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:operation'
                }),
                EntryFactory.selectBox({
                  id: 'inputParams',
                  //description: 'Input Parameter',
                  label: 'Input Parameter',
                  selectOptions: function (element) {
                    console.log(element);
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.options = [];
                          var arr = [];
                          if (element.businessObject.$attrs['qa:operation'] != undefined) {
                            for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {

                              if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs['qa:operation']) {
                                console.log('INPUT PARAMETER')
                                var parameter = CustomPropsProvider.tosca[i].value[j].inputParameters.inputParameter;
                                if (parameter != undefined) {
                                  CustomPropsProvider.options.push({ name: 'none', value: 'none' });
                                  var length = CustomPropsProvider.tosca[i].value[j].inputParameters.inputParameter.length;
                                  for (var k = 0; k < length; k++) {
                                    CustomPropsProvider.options.push({
                                      name: parameter[k].name, value: parameter[k].name + ',' + parameter[k].type
                                    });
                                  }
                                }
                              }
                            }
                            console.log(CustomPropsProvider.operations);

                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;
                            element.businessObject.$attrs['qa:inputParameter'] = CustomPropsProvider.options;
                            return CustomPropsProvider.options;
                          }
                        }
                      }

                    }
                    return CustomPropsProvider.options;
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:saveValueCheckbox'] = false;
                    element.businessObject.$attrs['qa:valueInput'] = '';

                    if (values['qa:inputParams'] != undefined) {
                      var s = values['qa:inputParams'].split(',');
                      element.businessObject.$attrs['qa:nameInput'] = s[0];
                      element.businessObject.$attrs['qa:typeInput'] = s[1];
                      console.log('TEST');
                      console.log(element.businessObject.$attrs['qa:inputParameter']);
                      if (element.businessObject.$attrs['qa:inputParameter'] != undefined) {
                        var param = element.businessObject.$attrs['qa:inputParameter'];
                        var length = param.length;

                        for (var i = 0; i < length; i++) {
                          console.log(param[i].name == element.businessObject.$attrs['qa:nameInput']);
                          if (param[i].name == element.businessObject.$attrs['qa:nameInput']) {
                            var split = param[i].value.split(',');
                            console.log(split)
                            if (split.length == 3) {
                              element.businessObject.$attrs['qa:valueInput'] = split[2];
                            }
                          }
                        }
                      } else {
                        element.businessObject.$attrs['qa:inputParameter'] = CustomPropsProvider.options;
                        element.businessObject.$attrs['qa:inputParams'] = values['qa:inputParams'];
                        return;
                      }

                      element.businessObject.$attrs['qa:inputParams'] = values['qa:inputParams'];
                      return;
                    }
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:inputParams'
                }),
                EntryFactory.textField({
                  id: 'nameInput',
                  //description: 'Name of Parameter',
                  label: 'Name of Parameter',
                  modelProperty: 'qa:nameInput'
                }),
                /**
                EntryFactory.textField({
                  id: 'typeInput',
                  description: 'Type of Parameter',
                  label: 'Type of Parameter',
                  modelProperty: 'qa:typeInput'
                }),
                 */
                EntryFactory.selectBox({
                  id: 'typeInput',
                  //description: 'Type of Parameter',
                  label: 'Type of Parameter',
                  selectOptions: function (element, values) {
                    //element.businessObject.$attrs['qa:typeInput'] = CustomPropsProvider.types;
                    return CustomPropsProvider.types;
                  },
                  set: function (element, values, node) {
                    // element.businessObject.$attrs['qa:typeInput']
                    if (values['qa:typeInput'] != 'none') {
                      element.businessObject.$attrs['qa:type2Input'] = values['qa:typeInput'];
                      element.businessObject.$attrs['qa:typeInput'] = values['qa:typeInput'];
                      return;
                    }
                    return;
                  },
                  setControlValue: true,
                  isHidden: true,
                  modelProperty: 'qa:typeInput'
                }),
                EntryFactory.selectBox({
                  id: 'deploymentArtifact',
                  //description: 'Deployment Artifact',
                  label: 'Deployment Artifact',
                  selectOptions: function (element, values) {
                    //element.businessObject.$attrs['qa:deploymentArtifact'] = CustomPropsProvider.DA;
                    return CustomPropsProvider.DA;
                  },
                  setControlValue: true,
                  //isHidden: false,
                  //isDisabled: true, 
                  modelProperty: 'qa:deploymentArtifact',
                  hidden: function(element, node){
                    console.log(element.businessObject.$attrs['qa:type2Input']);
                    if(element.businessObject.$attrs['qa:type2Input']=='DA'){
                      return false;
                    }else{
                      return true;
                    }
                  }
                }),
                EntryFactory.selectBox({
                  id: 'dataObject',
                  //description: 'Data Object ID',
                  label: 'Data Object ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    var arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    var saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:DataObjectReference') {
                          arr.push({ name: flowElement[i].id, value: flowElement[i].id });
                          saveDataObject.push({ name: flowElement[i], value: flowElement[i] });
                        }
                      }
                      element.businessObject.$attrs['qa:dataObjectV'] = saveDataObject;
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:dataObject'] != 'none') {
                      element.businessObject.$attrs['qa:dataObject'] = values['qa:dataObject'];
                      if (element.businessObject.$attrs['qa:dataObjectV'] != undefined) {
                        var dataObject = element.businessObject.$attrs['qa:dataObjectV'];
                        for (var i = 0; i < dataObject.length; i++) {
                          if (dataObject[i].name.id == element.businessObject.$attrs['qa:dataObject']) {
                            element.businessObject.$attrs['qa:dataObject0'] = dataObject[i].value;
                          }
                        }
                      }
                      return;
                    }
                  },
                  setControlValue: true,
                  hidden: function(element, node){
                    if(element.businessObject.$attrs['qa:type2Input']=='VALUE'){
                      return false;
                    }else{
                      return true;
                    }
                  },
                  modelProperty: 'qa:dataObject',
                }),
                EntryFactory.selectBox({
                  id: 'dataObjectProperties',
                  //description: 'Data Object ID',
                  label: 'Data Object Properties',
                  selectOptions: function (element, values) {
                    console.log("DATATATS")
                    console.log(element.businessObject.$attrs['qa:dataObjectV'])
                    return ;
                  },
                  set: function (element, values, node) {
                    return;
                  },
                  setControlValue: true,
                  hidden: function(element, node){
                    console.log(element.businessObject.$attrs['qa:dataObject']);
                    if(element.businessObject.$attrs['qa:dataObject']!='none' && element.businessObject.$attrs['qa:dataObject']!= undefined){
                      return false;
                    }else{
                      return true;
                    }
                  },
                  modelProperty: 'qa:dataObjectProperties',
                }),
                EntryFactory.textField({
                  id: 'valueInput',
                  //description: 'Value of Parameter',
                  label: 'Value of Parameter',
                  modelProperty: 'qa:valueInput',
                  hidden: function(element, node){
                    if(element.businessObject.$attrs['qa:type2Input']=='String'){
                      return false;
                    }else{
                      return true;
                    }
                  },
                }),
                EntryFactory.checkbox({
                  id: 'saveValueCheckbox',
                  description: 'Write the value back to the corresponding input parameter.',
                  label: 'Save',
                  modelProperty: 'qa:saveValueCheckbox',
                  validate: function (element, values) {
                    var check = values['qa:saveValueCheckbox'];
                    console.log(check);
                    console.log(element.businessObject.$attrs['qa:valueInput']);
                    console.log(element.businessObject.$attrs['qa:inputParameter']);

                    if (element.businessObject.$attrs['qa:valueInput'] != undefined && check) {

                      if (element.businessObject.$attrs['qa:inputParameter'] != undefined) {
                        var length = element.businessObject.$attrs['qa:inputParameter'].length;
                        for (var i = 0; i < length; i++) {
                          console.log(element.businessObject.$attrs['qa:inputParameter'][i].name);
                          console.log(element.businessObject.$attrs['qa:nameInput']);
                          if (element.businessObject.$attrs['qa:inputParameter'][i].name == element.businessObject.$attrs['qa:nameInput']) {
                            element.businessObject.$attrs['qa:inputParameter'][i].value = element.businessObject.$attrs['qa:inputParameter'][i].name + ',' +
                              element.businessObject.$attrs['qa:typeInput'] + ',' + element.businessObject.$attrs['qa:valueInput'];
                            console.log(element.businessObject.$attrs['qa:inputParameter'][i].value);
                          }
						  
						  // ---------------------------------------------------------------------------------------------------------------------
                              
                              const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                                  name: 'Input_' + element.businessObject.$attrs['qa:inputParameter'][i].name,
                                  value: element.businessObject.$attrs['qa:inputParameter'][i].value.split(',')[4]
                                  // mhm warum hat value objekte drin? der eigentliche input ist hinten angehängt...
                              });
                              // console.log('ist es hier?');
                              // console.log(element.businessObject.extensionElements.values[0].inputParameters);
                              
                              let addinput = true;
                              for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++ ) {
                                  if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                                      // updates den Wert bei Veränderung, übernimmt aber keine Änderungen aus dem Inputvariabelfeld
                                      element.businessObject.extensionElements.values[0].inputParameters[o].value = 
                                          element.businessObject.$attrs['qa:inputParameter'][i].value.split(',')[4];
                                      addinput = false;
                                  }
                              }
                              // verhindert das es immer wieder neue doppelte inputparameter erstellt
                              if (addinput) {
                                console.log("HCHHC");
                                console.log(inputParameter);
                                console.log(element.businessObject.extensionElements.values[0].inputParameters);
                                element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                                console.log(element.businessObject.extensionElements.values[0].inputParameters);
                                 
                                  
                              } else {
                                  addinput = true;
                              }
                              
                              // -------------------------------------------------------------------------------------------------------------------
						  
                          console.log(CustomPropsProvider.options);
                        }
                        for(var i=0; i<element.businessObject.extensionElements.values[0].inputParameters.length; i++){
                          console.log(element.businessObject.extensionElements.values[0].inputParameters[i].name);
                          if(element.businessObject.extensionElements.values[0].inputParameters[i].name=='Input_'+element.businessObject.$attrs['qa:nameInput']){
                            let type = element.businessObject.$attrs['qa:typeInput'];
                            if(type =='DA'){
                              let deploymentArtifact =element.businessObject.$attrs['qa:deploymentArtifact'];
                              element.businessObject.extensionElements.values[0].inputParameters[i].value = type + ";"+ deploymentArtifact;
                            }else if(type=='VALUE'){
                              let propertyofDataObject = '';
                              element.businessObject.extensionElements.values[0].inputParameters[i].value = type + '' + propertyofDataObject;
                            }else{
                              element.businessObject.extensionElements.values[0].inputParameters[i].value= type + ';' + element.businessObject.$attrs['qa:valueInput'];
                            }
                            
                          }
                        }
                        //element.businessObject.$attrs.inputParameter = CustomPropsProvider.options;
                      }
                    }
                  }
                }),
                EntryFactory.selectBox({
                  id: 'outputParams',
                  //description: 'Output Parameter',
                  label: 'Output Parameter',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.outputParam = [];
                          var arr = [];
                          if (element.businessObject.$attrs['qa:operation'] != undefined) {
                            for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                              if (element.businessObject.$attrs['qa:operation'] != 'none') {
                                if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs['qa:operation']) {
                                  console.log('OUTPUT PARAMETER')
                                  if (CustomPropsProvider.tosca[i].value[j].outputParameters != undefined) {
                                    var parameter = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter;
                                    if (parameter != undefined) {
                                      var length = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter.length;
                                      for (var k = 0; k < length; k++) {
                                        CustomPropsProvider.outputParam.push({
                                          name: parameter[k].name, value: parameter[k].name + ',' + parameter[k].type
                                        });
                                      }
                                    }
                                  }
                                }
                              }
                            }
                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;
                            element.businessObject.$attrs['qa:outputParams'] = CustomPropsProvider.outputParam;
                            return CustomPropsProvider.outputParam;
                          }
                        }
                      }
                    }
                    element.businessObject.$attrs['qa:outputParams'] = CustomPropsProvider.outputParam;
                    return CustomPropsProvider.outputParam;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:outputParams'
                })
              ]
            }]
        })
      /** 
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('OperationTask Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'dataObject',
                  description: 'Data Object ID',
                  label: 'Data Object ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    console.log(element);
                    console.log('DATAOBJECT');
                    var arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    var saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:DataObjectReference') {
                          arr.push({ name: flowElement[i].id, value: flowElement[i].id });
                          console.log(flowElement[i]);
                          saveDataObject.push({ name: flowElement[i], value: flowElement[i] });
                          console.log(flowElement[i]);
                        }
                      }
                      console.log(arr);
                      element.businessObject.$attrs.dataObjectV = saveDataObject;
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values.dataObject != 'none') {
                      element.businessObject.$attrs.dataObject = values.dataObject;
                      console.log("hiieer");
                      if (element.businessObject.$attrs.dataObjectV != undefined) {

                        console.log("heir ist nicht non")
                        var dataObject = element.businessObject.$attrs.dataObjectV;
                        console.log(element.businessObject.$attrs.dataObjectV);
                        for (var i = 0; i < dataObject.length; i++) {
                          console.log(dataObject[i].name);
                          console.log(element.businessObject.$attrs.dataObject);
                          if (dataObject[i].name.id == element.businessObject.$attrs.dataObject) {
                            console.log(dataObject[i].value);
                            element.businessObject.$attrs.dataObject0 = dataObject[i].value;
                            console.log("FINAL");
                            console.log(element.businessObject.$attrs.dataObject0);
                          }
                        }
                      }
                      return;
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'dataObject',
                }),
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'servicetemplateID'
                }),
                EntryFactory.textBox({
                  id: 'NodeTemplate',
                  description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  setControlValue: true,
                  modelProperty: 'NodeTemplate',
                  get: function (element, values) {
                    if (element.businessObject.$attrs.dataObject0 != undefined) {
                      if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[3].value = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                        return {
                          NodeTemplate: element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate
                        }
                      } else if (element.businessObject.$attrs.ntype === "NodeInstance") {
                        element.businessObject.extensionElements.values[0].inputParameters[0].value = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                        return {
                          NodeTemplate: element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate
                        }
                      }
                    } else {
                      console.log("fall2")
                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.NodeTemplate = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;

                    return;
                  }
                }),
                EntryFactory.textBox({
                  id: 'interface',
                  description: 'Interface',
                  label: 'Interface',
                  get: function (element, values) {
                    if (element.businessObject.$attrs.dataObject0 != undefined) {
                      // element.businessObject.$attrs.NodeTemplate = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                      if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[4].value = element.businessObject.$attrs.dataObject0.$attrs.interface;
                      }
                      return {
                        interface: element.businessObject.$attrs.dataObject0.$attrs.interface
                      }
                    } else {
                      //console.log("fall2")
                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.interface = element.businessObject.$attrs.dataObject0.$attrs.interface;
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'interface'
                }),
                EntryFactory.textBox({
                  id: 'operation',
                  description: 'Operation',
                  label: 'Operation',
                  get: function (element, values) {
                    if (element.businessObject.$attrs.dataObject0 != undefined) {
                      // element.businessObject.$attrs.NodeTemplate = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                      if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[5].value = element.businessObject.$attrs.dataObject0.$attrs.operation;
                      }
                      return {
                        operation: element.businessObject.$attrs.dataObject0.$attrs.operation
                      }
                    } else {
                      //console.log("fall2")
                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.operation = element.businessObject.$attrs.dataObject0.$attrs.operation;

                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'operation'
                }),
                EntryFactory.selectBox({
                  id: 'inputParams',
                  description: 'Input Parameter',
                  label: 'Input Parameter',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs.dataObject0 != undefined) {
                      var arr = [];
                      if (element.businessObject.$attrs.dataObject0.$attrs.inputParameter != undefined) {
                        for (var i = 0; i < element.businessObject.$attrs.dataObject0.$attrs.inputParameter.length; i++) {
                          arr.push({
                            name: element.businessObject.$attrs.dataObject0.$attrs.inputParameter[i].value,
                            value: element.businessObject.$attrs.dataObject0.$attrs.inputParameter[i].value
                          })
                        }

                        if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                          var names = [];
                          var valuesInput = [];
                          var param = element.businessObject.$attrs.dataObject0.$attrs.inputParameter;
                          for (var i = 0; i < element.businessObject.$attrs.dataObject0.$attrs.inputParameter.length; i++) {

                            var split = param[i].value.split(',');
                            if (split[0] != 'none') {
                              names.push(split[0]);
                              if (split[2] != undefined) {

                                valuesInput.push(split[2]);
                              }
                            }

                          }

                          if (is(element.businessObject, 'bpmn:ScriptTask')) {
                            if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                              element.businessObject.extensionElements.values[0].inputParameters[6].value = names.toString();
                              element.businessObject.extensionElements.values[0].inputParameters[7].value = valuesInput.toString();
                            }
                          }

                        }
                        return arr;
                      }
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.inputParameter = element.businessObject.$attrs.dataObject0.$attrs.inputParameter;
                    element.businessObject.$attrs.inputParams = values.inputParams;

                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'inputParams'
                }),
                EntryFactory.textField({
                  id: 'nameInput',
                  description: 'Name of Parameter',
                  label: 'Name of Parameter',
                  modelProperty: 'nameInput'
                }),
                EntryFactory.textField({
                  id: 'typeInput',
                  description: 'Type of Parameter',
                  label: 'Type of Parameter',
                  modelProperty: 'typeInput'
                }),
                EntryFactory.textField({
                  id: 'valueInput',
                  description: 'Value of Parameter',
                  label: 'Value of Parameter',
                  modelProperty: 'valueInput'
                }),
                EntryFactory.checkbox({
                  id: 'saveValueCheckbox',
                  description: 'Write the value back to the corresponding input parameter.',
                  label: 'Save',
                  modelProperty: 'saveValueCheckbox',
                  validate: function (element, values) {
                    console.log('Checkbox');
                    console.log(element);
                    var check = values.saveValueCheckbox;
                    console.log('VALUE OF INPUT PARAM');
                    console.log(values);
                    if (element.businessObject.$attrs.valueInput != undefined && check) {
                      if (element.businessObject.$attrs.inputParameter != undefined) {
                        var length = element.businessObject.$attrs.inputParameter.length;
                        for (var i = 0; i < length; i++) {

                          if (element.businessObject.$attrs.inputParameter[i].name == element.businessObject.$attrs.nameInput) {
                            element.businessObject.$attrs.inputParameter[i].value = element.businessObject.$attrs.inputParameter[i].name + ',' +
                              element.businessObject.$attrs.typeInput + ',' + element.businessObject.$attrs.valueInput;
                          }
                          console.log(CustomPropsProvider.options);
                        }
                        //element.businessObject.$attrs.inputParameter = CustomPropsProvider.options;
                      }
                    }
                  }
                }),
                EntryFactory.selectBox({
                  id: 'outputParams',
                  description: 'Output Parameter',
                  label: 'Output Parameter',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs.interface != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs.interface) {
                          CustomPropsProvider.outputParam = [];
                          var arr = [];
                          if (element.businessObject.$attrs.operation != undefined) {
                            for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                              if (element.businessObject.$attrs.operation != 'none') {
                                if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs.operation) {
                                  console.log('OUTPUT PARAMETER')
                                  if (CustomPropsProvider.tosca[i].value[j].outputParameters != undefined) {
                                    var parameter = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter;
                                    if (parameter != undefined) {
                                      var length = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter.length;
                                      for (var k = 0; k < length; k++) {
                                        CustomPropsProvider.outputParam.push({
                                          name: parameter[k].name, value: parameter[k].name + ',' + parameter[k].type
                                        });
                                      }

                                    }
                                  }
                                }
                              }
                            }
                            console.log("GEHT DAS HIER");

                            element.businessObject.$attrs.outputParams = CustomPropsProvider.outputParam;
                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;
                            return CustomPropsProvider.outputParam;
                          }
                        }
                      }
                    }
                    console.log("GEHT DAS HIER");

                    element.businessObject.$attrs.outputParams = CustomPropsProvider.outputParam;
                    return CustomPropsProvider.outputParam;
                  },
                  setControlValue: true,
                  modelProperty: 'outputParams'
                })
              ]
            }]
        })
        */
    } else if (element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs['qa:ntype'] == 'NodeInstance') {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('Data Object Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'NodeTemplate',
                  //description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    return CustomPropsProvider.template;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    console.log("das ausgewählte Element ist");
                    if (values['qa:NodeTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                      if (values['qa:NodeTemplate'] != undefined) {
                        element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];

                        //inputtests
                        if (is(element.businessObject, 'bpmn:ScriptTask')) {
                          if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                            element.businessObject.extensionElements.values[0].inputParameters[3].value = values['qa:NodeTemplate'];
                          } else if (element.businessObject.$attrs['qa:ntype'] === "NodeInstance") {
                            element.businessObject.extensionElements.values[0].inputParameters[0].value = values['qa:NodeTemplate'];
                          }
                        }
                        //
                        return;
                      }
                    }
                    return;
                  }
                })]
            }]
        })
    } else if (element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs['qa:ntype'] == 'ServiceTemplateInstance') {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'serviceInstanceProp',
              label: this.translate('Service Data Object Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'dataObject',
                  //description: 'Data Object ID',
                  label: 'Data Object ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    var arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    var saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:DataObjectReference') {
                          arr.push({ name: flowElement[i].id, value: flowElement[i].id });
                          saveDataObject.push({ name: flowElement[i], value: flowElement[i] });
                        }
                      }
                      element.businessObject.$attrs['qa:dataObjectV'] = saveDataObject;
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:dataObject'] != 'none') {
                      element.businessObject.$attrs['qa:dataObject'] = values['qa:dataObject'];
                      if (element.businessObject.$attrs['qa:dataObjectV'] != undefined) {
                        var dataObject = element.businessObject.$attrs['qa:dataObjectV'];
                        for (var i = 0; i < dataObject.length; i++) {
                          if (dataObject[i].name.id == element.businessObject.$attrs['qa:dataObject']) {
                            element.businessObject.$attrs['qa:dataObject0'] = dataObject[i].value;
                          }
                        }
                      }
                      return;
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'qa:dataObject',
                }),
                EntryFactory.textBox({
                  id: 'serviceInstanceID',
                  //description: 'ServiceInstance ID',
                  label: 'Service Instance ID',
                  modelProperty: 'qa:serviceinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  //description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'qa:servicetemplateID',
                  get: function (element, values) {
                    if (element.businessObject.$attrs['qa:dataObject0'] != undefined) {
                      // element.businessObject.$attrs.NodeTemplate = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                      return {
                        'qa:servicetemplateID': element.businessObject.$attrs['qa:dataObject0'].$attrs['qa:servicetemplateID']
                      }
                    } else {

                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs['qa:servicetemplateID'] = element.businessObject.$attrs['qa:dataObject0'].$attrs['qa:servicetemplateID'];
                    return;
                  }
                }),
                EntryFactory.textBox({
                  id: 'CSARID',
                  //description: 'CSAR ID',
                  label: 'CSAR ID',
                  modelProperty: 'qa:CSARID',
                  get: function (element, values) {
                    if (element.businessObject.$attrs['qa:dataObject0'] != undefined) {
                      return {
                        'qa:CSARID': element.businessObject.$attrs['qa:dataObject0'].$attrs['qa:CSARID']
                      }
                    } else {

                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs['qa:CSARID'] = element.businessObject.$attrs['qa:dataObject0'].$attrs['qa:CSARID'];
                    return;
                  }
                }),

              ]
            }]
        });

    } else if ((element.businessObject.$type == 'bpmn:ScriptTask') && (element.businessObject.$attrs['qa:ntype'] == "RelationshipInstance")) {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'relationshipInstanceProp',
              label: this.translate('Relationship Data Object Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'dataObject',
                  //description: 'Data Object ID',
                  label: 'Data Object ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    console.log(element);
                    console.log('DATAOBJECT');
                    var arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    var saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:DataObjectReference') {
                          arr.push({ name: flowElement[i].id, value: flowElement[i].id });
                          console.log(flowElement[i]);
                          saveDataObject.push({ name: flowElement[i], value: flowElement[i] });
                          console.log(flowElement[i]);
                        }
                      }
                      console.log(arr);
                      element.businessObject.$attrs['qa:dataObjectV'] = saveDataObject;
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:dataObject'] != 'none') {
                      element.businessObject.$attrs['qa:dataObject'] = values['qa:dataObject'];
                      //console.log("hiieer");
                      if (element.businessObject.$attrs['qa:dataObjectV'] != undefined) {

                        console.log("heir ist nicht non")
                        var dataObject = element.businessObject.$attrs['qa:dataObjectV'];
                        console.log(element.businessObject.$attrs['qa:dataObjectV']);
                        for (var i = 0; i < dataObject.length; i++) {
                          console.log(dataObject[i].name);
                          console.log(element.businessObject.$attrs['qa:dataObject']);
                          if (dataObject[i].name.id == element.businessObject.$attrs['qa:dataObject']) {
                            console.log(dataObject[i].value);
                            element.businessObject.$attrs['qa:dataObject0'] = dataObject[i].value;
                            console.log("FINAL");
                            console.log(element.businessObject.$attrs['qa:dataObject0']);
                          }
                        }
                      }
                      return;
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'qa:dataObject',
                }),
                EntryFactory.textBox({
                  id: 'RelationshipInstanceID',
                  //description: 'RelationshipInstance ID',
                  label: 'Relationship Instance ID',
                  modelProperty: 'qa:relationshipinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'SourceURL',
                  //description: 'SourceURL',
                  label: 'SourceURL',
                  modelProperty: 'qa:SourceURL'
                }),
                EntryFactory.textBox({
                  id: 'TargetURL',
                  //description: 'TargetURL',
                  label: 'TargetURL',
                  modelProperty: 'qa:TargetURL'
                }),

              ]
            }]
        });
    } else if ((element.businessObject.$type == 'bpmn:DataObjectReference') && (element.businessObject.$attrs['qa:dtype'] == "NodeInstanceDataObject")) {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('Data Object Properties'),
              entries: [
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  //description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'qa:servicetemplateID'
                }),
                EntryFactory.selectBox({
                  id: 'NodeTemplate',
                  //description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    return CustomPropsProvider.template;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    console.log("das ausgewählte Element ist");
                    if (values['qa:NodeTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];

                      console.log(element);
                      element.businessObject.$attrs['qa:interface'] = [];
                      element.businessObject.$attrs['qa:operation'] = [];
                      if (values['qa:NodeTemplate'] != undefined) {
                        var namespace = 'http://opentosca.org/nodetypes';
                        const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                          + '/' + encodeURIComponent(encodeURIComponent((values['qa:NodeTemplate']))) + '/interfaces/';
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
                                CustomPropsProvider.tosca.push({ name: response[i].name, value: response[i].operation });
                                array.push({
                                  name: response[i].name, value: response[i].name
                                });
                                CustomPropsProvider.interfaces.push({
                                  name: response[i].name, value: response[i].name
                                })
                                console.log('HIER Array');
                                console.log(array);
                                window['interfaceN'] = array;
                              }

                              console.log(CustomPropsProvider.interfaces);
                              element.businessObject.$attrs['qa:interface'] = CustomPropsProvider.interfaces;

                              console.log(element);
                              resolve(CustomPropsProvider.interfaces);
                            }

                          }
                        }).then(response => {
                          return response
                        })
                        element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];

                        //inputtests
                        if (is(element.businessObject, 'bpmn:ScriptTask')) {
                          if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                            console.log("DAS IST SETZT DAS ")
                            element.businessObject.extensionElements.values[0].inputParameters[3].value = values['qa:NodeTemplate'];
                          } else if (element.businessObject.$attrs['qa:ntype'] === "NodeInstance") {
                            element.businessObject.extensionElements.values[0].inputParameters[0].value = values['qa:NodeTemplate'];
                          }
                        }
                        //
                        return;
                      }
                    }
                    return;
                  }
                }),
                EntryFactory.selectBox({
                  id: 'interface',
                  //description: 'Interface',
                  label: 'Interface',
                  selectOptions: function (element, values) {
                    console.log(values);
                    console.log('SELECTOPTIONS')
                    //element.businessObject.$attrs.operation = [];
                    console.log(element.businessObject.$attrs['qa:NodeTemplate']);
                    if (element.businessObject.$attrs['qa:NodeTemplate'] != undefined) {
                      var namespace = 'http://opentosca.org/nodetypes';
                      const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                        + '/' + encodeURIComponent(encodeURIComponent((element.businessObject.$attrs['qa:NodeTemplate']))) + '/interfaces/';
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
                            //CustomPropsProvider.tosca = [];
                            for (var i = 0; i < response.length; i++) {
                              array.push({
                                name: response[i].name, value: response[i].name
                              });
                              CustomPropsProvider.interfaces.push({
                                name: response[i].name, value: response[i].name
                              })
                              console.log('HIER Array');
                              console.log(array);
                              window['interfaceN'] = array;

                            }
                            console.log("INTERFACES CUSTOM")
                            console.log(CustomPropsProvider.interfaces);
                            //element.businessObject.$attrs.interface = CustomPropsProvider.interfaces;
                            console.log(element);
                            resolve(CustomPropsProvider.interfaces);
                          }

                        }
                      }).then(response => {
                        return CustomPropsProvider.interfaces
                      })
                      //element.businessObject.$attrs.nodetemplate = values.nodetemplate;
                      console.log(window['interfaceN']);
                      return CustomPropsProvider.interfaces;
                    }
                  },
                  set: function (element, values, node) {
                    console.log(element);
                    console.log('SET Interface');
                    console.log(values['qa:interface']);
                    element.businessObject.$attrs['qa:interface'] = values['qa:interface'];
                    //inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[4].value = values['qa:interface'];
                      }
                    }
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          console.log("DER SET VALUE");
                          console.log(CustomPropsProvider.tosca[i].value.length);
                          var arr = [];
                          for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                            CustomPropsProvider.operations.push({
                              name: CustomPropsProvider.tosca[i].value[j].name, value:
                                CustomPropsProvider.tosca[i].value[j].name
                            });
                          }

                          element.businessObject.$attrs['qa:operation'] = values['qa:operation'];
                          return;
                        }
                      }
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'qa:interface'
                }),
                EntryFactory.selectBox({
                  id: 'operation',
                  //description: 'Operation',
                  label: 'Operation',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.operations = [];
                          var arr = [];
                          CustomPropsProvider.operations.push({ name: 'none', value: 'none' });
                          for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                            CustomPropsProvider.operations.push({
                              name: CustomPropsProvider.tosca[i].value[j].name, value:
                                CustomPropsProvider.tosca[i].value[j].name
                            });
                          }
                          //console.log(CustomPropsProvider.operations);

                          //element.businessObject.$attrs.operation = values.operations;

                          return CustomPropsProvider.operations;
                        }
                      }

                    }
                    return CustomPropsProvider.operations;
                  }, set: function (element, values, node) {
                    console.log(values['qa:operation']);
                    element.businessObject.$attrs['qa:operation'] = values['qa:operation'];
                    //inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[5].value = values['qa:operation'];
                      }
                    }
                    console.log(element);
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:operation'
                }),
                EntryFactory.selectBox({
                  id: 'inputParams',
                  //description: 'Input Parameter',
                  label: 'Input Parameter',
                  selectOptions: function (element) {
                    console.log(element);
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.options = [];
                          var arr = [];
                          if (element.businessObject.$attrs['qa:operation'] != undefined) {
                            for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                              console.log("VERGLEICH");
                              console.log(CustomPropsProvider.tosca[i].value[j].name);
                              console.log(element.businessObject.$attrs['qa:operation']);
                              if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs['qa:operation']) {
                                console.log('INPUT PARAMETER')
                                var parameter = CustomPropsProvider.tosca[i].value[j].inputParameters.inputParameter;
                                if (parameter != undefined) {
                                  CustomPropsProvider.options.push({ name: 'none', value: 'none' });
                                  var length = CustomPropsProvider.tosca[i].value[j].inputParameters.inputParameter.length;
                                  for (var k = 0; k < length; k++) {
                                    CustomPropsProvider.options.push({
                                      name: parameter[k].name, value: parameter[k].name + ',' + parameter[k].type
                                    });
                                  }
                                }
                              }
                            }
                            console.log(CustomPropsProvider.operations);

                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;

                            return CustomPropsProvider.options;
                          }
                        }
                      }

                    }
                    return CustomPropsProvider.options;
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:saveValueCheckbox'] = false;
                    element.businessObject.$attrs['qa:valueInput'] = '';
                    console.log('SET INPUT');
                    console.log(element);
                    if (values['qa:inputParams'] != undefined) {
                      var s = values['qa:inputParams'].split(',');
                      element.businessObject.$attrs['qa:nameInput'] = s[0];
                      element.businessObject.$attrs['qa:typeInput'] = s[1];
                      if (element.businessObject.$attrs['qa:inputParameter'] != undefined) {
                        var param = element.businessObject.$attrs['qa:inputParameter'];
                        var length = param.length;

                        for (var i = 0; i < length; i++) {
                          if (param[i].name == element.businessObject.$attrs['qa:nameInput']) {
                            var split = param[i].value.split(',');
                            if (split.length == 3) {
                              element.businessObject.$attrs['qa:valueInput'] = split[2];
                            }
                          }
                        }
                      } else {
                        element.businessObject.$attrs['qa:inputParameter'] = CustomPropsProvider.options;
                        element.businessObject.$attrs['qa:inputParams'] = values['qa:inputParams'];
                        return;
                      }

                      element.businessObject.$attrs['qa:inputParams'] = values['qa:inputParams'];
                      return;
                    }
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:inputParams'
                }),
                EntryFactory.textField({
                  id: 'nameInput',
                  //description: 'Name of Parameter',
                  label: 'Name of Parameter',
                  modelProperty: 'qa:nameInput'
                }),
                EntryFactory.textField({
                  id: 'typeInput',
                  //description: 'Type of Parameter',
                  label: 'Type of Parameter',
                  modelProperty: 'qa:typeInput'
                }),
                EntryFactory.textField({
                  id: 'valueInput',
                  //description: 'Value of Parameter',
                  label: 'Value of Parameter',
                  modelProperty: 'qa:valueInput'
                }),
                EntryFactory.checkbox({
                  id: 'saveValueCheckbox',
                  description: 'Write the value back to the corresponding input parameter.',
                  label: 'Save',
                  modelProperty: 'qa:saveValueCheckbox',
                  validate: function (element, values) {
                    console.log('Checkbox');
                    console.log(element);
                    var check = values['qa:saveValueCheckbox'];
                    console.log('VALUE OF INPUT PARAM');
                    console.log(values);
                    if (element.businessObject.$attrs['qa:valueInput'] != undefined && check) {
                      if (element.businessObject.$attrs['qa:inputParameter'] != undefined) {
                        var length = element.businessObject.$attrs['qa:inputParameter'].length;
                        for (var i = 0; i < length; i++) {

                          if (element.businessObject.$attrs['qa:inputParameter'][i].name == element.businessObject.$attrs['qa:nameInput']) {
                            element.businessObject.$attrs['qa:inputParameter'][i].value = element.businessObject.$attrs['qa:inputParameter'][i].name + ',' +
                              element.businessObject.$attrs['qa:typeInput'] + ',' + element.businessObject.$attrs['qa:valueInput'];
                          }
                          console.log(CustomPropsProvider.options);
                        }
                        //element.businessObject.$attrs['qa:inputParameter'] = CustomPropsProvider.options;
                      }
                    }
                  }
                }),
                EntryFactory.selectBox({
                  id: 'outputParams',
                  //description: 'Output Parameter',
                  label: 'Output Parameter',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs['qa:interface'] != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.outputParam = [];
                          var arr = [];
                          if (element.businessObject.$attrs['qa:operation'] != undefined) {
                            for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                              if (element.businessObject.$attrs['qa:operation'] != 'none') {
                                if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs['qa:operation']) {
                                  console.log('OUTPUT PARAMETER')
                                  if (CustomPropsProvider.tosca[i].value[j].outputParameters != undefined) {
                                    var parameter = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter;
                                    if (parameter != undefined) {
                                      var length = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter.length;
                                      for (var k = 0; k < length; k++) {
                                        CustomPropsProvider.outputParam.push({
                                          name: parameter[k].name, value: parameter[k].name + ',' + parameter[k].type
                                        });
                                      }
                                    }
                                  }
                                }
                              }
                            }
                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;
                            return CustomPropsProvider.outputParam;
                          }
                        }
                      }
                    }
                    return CustomPropsProvider.outputParam;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:outputParams'
                })
              ]
            }]
        })

    } else if ((element.businessObject.$type == 'bpmn:DataObjectReference') && (element.businessObject.$attrs['qa:dtype'] == "ServiceInstanceDataObject")) {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'servideInstanceProp',
              label: this.translate('Service Data Object Properties'),
              entries: [
                EntryFactory.textBox({
                  id: 'serviceInstanceID',
                  //description: 'ServiceInstance ID',
                  label: 'Service Instance ID',
                  modelProperty: 'qa:serviceinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  //description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'qa:servicetemplateID',
                  get: function () {
                    element.businessObject.$attrs['qa:servicetemplateID'] = CustomPropsProvider.winery2.serviceTemplateId;
                    return {
                      'qa:servicetemplateID': CustomPropsProvider.winery2.serviceTemplateId
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs['qa:servicetemplateID'] = CustomPropsProvider.winery2.serviceTemplateId;
                  }
                }),
                EntryFactory.textBox({
                  id: 'CSARID',
                  //description: 'CSAR ID',
                  label: 'CSAR ID',
                  modelProperty: 'qa:CSARID',
                  get: function () {
                    element.businessObject.$attrs['qa:CSARID'] = CustomPropsProvider.winery2.serviceTemplateId + '.csar';
                    return {
                      'qa:CSARID': CustomPropsProvider.winery2.serviceTemplateId + '.csar'
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs['qa:CSARID'] = CustomPropsProvider.winery2.serviceTemplateId + '.csar';
                  }
                }),

              ]
            }]
        });
    } else if ((element.businessObject.$type == 'bpmn:DataObjectReference') && (element.businessObject.$attrs['qa:dtype'] == "RelationshipInstanceDataObject")) {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'relationshipInstanceProp',
              label: this.translate('Relationship Data Object Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'RelationshipInstanceID',
                  //description: 'RelationshipInstance ID',
                  label: 'Relationship Instance ID',
                  modelProperty: 'qa:relationshipinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'SourceURL',
                  //description: 'SourceURL',
                  label: 'SourceURL',
                  modelProperty: 'qa:SourceURL'
                }),
                EntryFactory.textBox({
                  id: 'TargetURL',
                  //description: 'TargetURL',
                  label: 'TargetURL',
                  modelProperty: 'qa:TargetURL'
                }),

              ]
            }]
        });
    } else if ((element.businessObject.$type == 'bpmn:ScriptTask') && (element.businessObject.$attrs['qa:ntype'] == "StateChanger")) {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'SetStateProp',
              label: this.translate('SetState Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'State',
                  //description: 'State',
                  label: 'State',
                  selectOptions: function (element, values) {
                    if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                      // Set changed value
                      if (is(element.businessObject, 'bpmn:ScriptTask')) {
                        if (element.businessObject.$attrs['qa:ntype'] === "StateChanger") {
                          element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                        }
                      }
                    }
                    return CustomPropsProvider.opt;

                  },
                  setControlValue: true,
                  modelProperty: 'qa:State'
                }),
                EntryFactory.selectBox({
                  id: 'InstanceID',
                  //description: 'Instance ID',
                  label: 'Instance ID',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      var arr = [];
                      arr.push({ name: undefined, value: undefined });
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                      if (is(element.businessObject, 'bpmn:ScriptTask')) {
                        if (element.businessObject.$attrs['qa:ntype'] === "StateChanger") {
                          element.businessObject.$attrs['qa:instanceID'] = values['qa:instanceID'];
                          element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:instanceID'];
                        }
                      }
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:instanceID'
                })
              ]
            }]
        });
    } else if(element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs['qa:ntype'] === "PropertiesChanger") {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('OperationTask Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'InstanceID',
                  //description: 'Instance ID',
                  label: 'Instance ID',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      var arr = [];
                      arr.push({ name: undefined, value: undefined });
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                      if (is(element.businessObject, 'bpmn:ScriptTask')) {
                        if (element.businessObject.$attrs['qa:ntype'] === "PropertiesChanger") {
                          element.businessObject.$attrs['qa:instanceID'] = values['qa:instanceID'];
                          element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:instanceID'];
                        }
                      }
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:instanceID'
                }),
                EntryFactory.selectBox({
                  id: 'NodeTemplate',
                  //description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    return CustomPropsProvider.template;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    if (values['qa:NodeTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                        if (is(element.businessObject, 'bpmn:ScriptTask')) {
                          if (element.businessObject.$attrs['qa:ntype'] === "PropertiesChanger") {
                            element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:NodeTemplate'];
                          } 
                        }
                        return;
                    }
                    return;
                  }, 
                }),
                EntryFactory.selectBox({
                  id: 'properties',
                  //description: 'NodeTemplate',
                  label: 'Properties',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    //return CustomPropsProvider.properties;
                    console.log(CustomPropsProvider.properties);
                    for(let i = 0; i<CustomPropsProvider.properties.length; i++){
                      var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                      if(CustomPropsProvider.properties[i].id ==nodetemplate){
                        var options = [{ name: 'none', value: 'none' }];
                        let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                        properties = JSON.stringify(properties).split(",");
                        
                        for(let j=0; j<properties.length; j++){
                          let property = properties[j].split(':')[0].replace("{","");
                         if(property.startsWith("\"") && property.endsWith("\"")){
                           property = property.substring(1, property.length-1);
                         }
                         options.push({name:property, value: property})
                        }
                        //options.push({name: , value: });
                        
                      
                      }
                    }
                    return options;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:Properties',
                  set: function (element, values, node) {
                    if (values['qa:Properties'] != 'none') {
                      element.businessObject.$attrs['qa:Properties'] = values['qa:Properties'];
                        if (is(element.businessObject, 'bpmn:ScriptTask')) {
                          if (element.businessObject.$attrs['qa:ntype'] === "PropertiesChanger") {
                            element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:Properties'];
                          } 
                        }
                        return;
                    }
                    return;
                  }, 
                }),
                EntryFactory.textField({
                  id: 'valueInput',
                  //description: 'Value of Parameter',
                  label: 'Value of Property',
                  modelProperty: 'qa:valueProp',
                  hidden: function(element, node){
                    console.log(element.businessObject.$attrs['qa:Property']);
                    if(element.businessObject.$attrs['qa:Properties']=='none' || element.businessObject.$attrs['qa:Properties']==undefined ){
                      return true;
                    }else{
                      return false;
                    }
                  },
                }),
              ]
            }]
      })}
      else if (element.businessObject.$type == 'bpmn:DataObjectReference') {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('OperationTask Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'task',
                  //description: 'Task ID',
                  label: 'Task ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    var arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    var saveTask = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      var find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:ScriptTask') {
                          arr.push({ name: flowElement[i].id, value: flowElement[i].id });
                          console.log(flowElement[i]);
                          saveTask.push({ name: flowElement[i], value: flowElement[i] });
                          console.log(flowElement[i]);
                        }
                      }
                      console.log(arr);
                      element.businessObject.$attrs['qa:dataObjectV'] = saveTask;
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:task'] != 'none') {
                      element.businessObject.$attrs['qa:task'] = values['qa:task'];
                      if (element.businessObject.$attrs['qa:dataObjectV'] != undefined) {
                        var tasks = element.businessObject.$attrs['qa:dataObjectV'];
                        console.log(element.businessObject.$attrs['qa:dataObjectV']);
                        for (var i = 0; i < tasks.length; i++) {

                          if (tasks[i].name.id == element.businessObject.$attrs['qa:task']) {

                            element.businessObject.$attrs['qa:dataObject0'] = tasks[i].value;
                          }
                        }
                      }
                      return;
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'qa:task',
                }),
                EntryFactory.selectBox({
                  id: 'outputParamTask',
                  //description: 'Task ID',
                  label: 'Task ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    var arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    var saveTask = [];
                    if (element.businessObject.$attrs['qa:task'] != undefined) {

                      var task = element.businessObject.$attrs['qa:dataObject0'];
                      if (element.businessObject.$attrs['qa:dataObject0'] != undefined) {
                        var outputParam = task.$attrs['qa:outputParams'];
                        if (outputParam != undefined) {

                          for (var i = 0; i < outputParam.length; i++) {
                            arr.push({ name: outputParam[i].name, value: outputParam[i].name });
                          }
                          return arr;
                        }
                      }

                    }
                  },
                  set: function (element, values, node) {
                    //element.businessObject.$attrs.inputParameter = element.businessObject.$attrs.dataObject0.$attrs.inputParameter;
                    element.businessObject.$attrs['qa:outputParamTask'] = values['qa:outputParamTask'];

                  },
                  setControlValue: true,
                  modelProperty: 'qa:outputParamTask',
                }),
                EntryFactory.textField({
                  id: 'valueOutput',
                  //description: 'Value of Output Parameter',
                  label: 'Value of Output Parameter',
                  modelProperty: 'qa:valueOutput'
                }),
              ]
            }]
        })
      }else {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('OperationTask Properties'),
              entries: [
              ]
            }]
        });
    }
    }
  
}
