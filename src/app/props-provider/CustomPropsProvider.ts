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
import { is } from 'bpmn-js/lib/util/ModelUtil';



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
  static opt = [{name: 'CREATED', value: 'CREATED'}, {name: 'CREATING', value: 'CREATING'}, {name: 'DELETED', value: 'DELETED'}];


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
    //console.log(CustomPropsProvider.options);

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
    console.log("Elenebt");
    console.log(element);
    if (element.businessObject.$type == 'bpmn:ScriptTask' && (element.businessObject.$attrs.ntype == 'NodeInstance' || element.businessObject.$attrs.ntype === "CallNodeOperation")) {
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
                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;
                            return CustomPropsProvider.outputParam;
                          }
                        }
                      }
                    }
                    return CustomPropsProvider.outputParam;
                  },
                  setControlValue: true,
                  modelProperty: 'outputParams'
                })
              ]
            }]
        })
    } else if (element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs.ntype == 'ServiceTemplateInstance') {
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
                      // console.log("hiieer");
                      if (element.businessObject.$attrs.dataObjectV != undefined) {

                        //console.log("heir ist nicht non")
                        var dataObject = element.businessObject.$attrs.dataObjectV;
                        //console.log(element.businessObject.$attrs.dataObjectV);
                        for (var i = 0; i < dataObject.length; i++) {
                          //console.log(dataObject[i].name);
                          //console.log(element.businessObject.$attrs.dataObject);
                          if (dataObject[i].name.id == element.businessObject.$attrs.dataObject) {
                            console.log(dataObject[i].value);
                            element.businessObject.$attrs.dataObject0 = dataObject[i].value;
                            //console.log("FINAL");
                            //console.log(element.businessObject.$attrs.dataObject0);
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
                  id: 'serviceInstanceID',
                  description: 'ServiceInstance ID',
                  label: 'Service Instance ID',
                  modelProperty: 'serviceinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'servicetemplateID',
                  get: function (element, values) {
                    if (element.businessObject.$attrs.dataObject0 != undefined) {
                      // element.businessObject.$attrs.NodeTemplate = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                      return {
                        servicetemplateID: element.businessObject.$attrs.dataObject0.$attrs.servicetemplateID
                      }
                    } else {

                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.servicetemplateID = element.businessObject.$attrs.dataObject0.$attrs.servicetemplateID;
                    return;
                  }
                }),
                EntryFactory.textBox({
                  id: 'CSARID',
                  description: 'CSAR ID',
                  label: 'CSAR ID',
                  modelProperty: 'CSARID',
                  get: function (element, values) {
                    if (element.businessObject.$attrs.dataObject0 != undefined) {
                      // element.businessObject.$attrs.NodeTemplate = element.businessObject.$attrs.dataObject0.$attrs.NodeTemplate;
                      return {
                        CSARID: element.businessObject.$attrs.dataObject0.$attrs.CSARID
                      }
                    } else {

                      return element;
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.CSARID = element.businessObject.$attrs.dataObject0.$attrs.CSARID;
                    return;
                  }
                }),

              ]
            }]
        });

    } else if ((element.businessObject.$type == 'bpmn:ScriptTask') && (element.businessObject.$attrs.ntype == "RelationshipInstance")) {
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
                      //console.log("hiieer");
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
                  id: 'RelationshipInstanceID',
                  description: 'RelationshipInstance ID',
                  label: 'Relationship Instance ID',
                  modelProperty: 'relationshipinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'SourceURL',
                  description: 'SourceURL',
                  label: 'SourceURL',
                  modelProperty: 'SourceURL'
                }),
                EntryFactory.textBox({
                  id: 'TargetURL',
                  description: 'TargetURL',
                  label: 'TargetURL',
                  modelProperty: 'TargetURL'
                }),

              ]
            }]
        });
    } else if ((element.businessObject.$type == 'bpmn:DataObjectReference') && (element.businessObject.$attrs.dtype == "NodeInstanceDataObject")) {
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
                    if (values.NodeTemplate != 'none') {
                      element.businessObject.$attrs.NodeTemplate = values.NodeTemplate;

                      console.log(element);
                      element.businessObject.$attrs.interface = [];
                      element.businessObject.$attrs.operation = [];
                      if (values.NodeTemplate != undefined) {
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
                              element.businessObject.$attrs.interface = CustomPropsProvider.interfaces;

                              console.log(element);
                              resolve(CustomPropsProvider.interfaces);
                            }

                          }
                        }).then(response => {
                          return response
                        })
                        element.businessObject.$attrs.NodeTemplate = values.NodeTemplate;

                        //inputtests
                        if (is(element.businessObject, 'bpmn:ScriptTask')) {
                          if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                            console.log("DAS IST SETZT DAS ")
                            element.businessObject.extensionElements.values[0].inputParameters[3].value = values.NodeTemplate;
                          } else if (element.businessObject.$attrs.ntype === "NodeInstance") {
                            element.businessObject.extensionElements.values[0].inputParameters[0].value = values.NodeTemplate;
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
                  description: 'Interface',
                  label: 'Interface',
                  selectOptions: function (element, values) {
                    console.log(values);
                    console.log('SELECTOPTIONS')
                    //element.businessObject.$attrs.operation = [];
                    console.log(element.businessObject.$attrs.nodetemplate);
                    if (element.businessObject.$attrs.NodeTemplate != undefined) {
                      var namespace = 'http://opentosca.org/nodetypes';
                      const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
                        + '/' + encodeURIComponent(encodeURIComponent((element.businessObject.$attrs.NodeTemplate))) + '/interfaces/';
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
                    console.log(values.interface);
                    element.businessObject.$attrs.interface = values.interface;
                    //inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[4].value = values.interface;
                      }
                    }
                    if (element.businessObject.$attrs.interface != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs.interface) {
                          console.log("DER SET VALUE");
                          console.log(CustomPropsProvider.tosca[i].value.length);
                          var arr = [];
                          for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                            CustomPropsProvider.operations.push({
                              name: CustomPropsProvider.tosca[i].value[j].name, value:
                                CustomPropsProvider.tosca[i].value[j].name
                            });
                          }

                          element.businessObject.$attrs.operation = values.operation;
                          return;
                        }
                      }
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'interface'
                }),
                EntryFactory.selectBox({
                  id: 'operation',
                  description: 'Operation',
                  label: 'Operation',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$attrs.interface != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs.interface) {
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
                    console.log('SEEEEEEEEEE')
                    console.log(values.operation);
                    element.businessObject.$attrs.operation = values.operation;
                    //inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[5].value = values.operation;
                      }
                    }
                    console.log(element);
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'operation'
                }),
                EntryFactory.selectBox({
                  id: 'inputParams',
                  description: 'Input Parameter',
                  label: 'Input Parameter',
                  selectOptions: function (element) {
                    console.log(element);
                    if (element.businessObject.$attrs.interface != undefined) {
                      for (var i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs.interface) {
                          CustomPropsProvider.options = [];
                          var arr = [];
                          if (element.businessObject.$attrs.operation != undefined) {
                            for (var j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                              console.log("VERGLEICH");
                              console.log(CustomPropsProvider.tosca[i].value[j].name);
                              console.log(element.businessObject.$attrs.operation);
                              if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs.operation) {
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
                    element.businessObject.$attrs.saveValueCheckbox = false;
                    element.businessObject.$attrs.valueInput = '';
                    console.log('SET INPUT');
                    console.log(element);
                    if (values.inputParams != undefined) {
                      var s = values.inputParams.split(',');
                      element.businessObject.$attrs.nameInput = s[0];
                      element.businessObject.$attrs.typeInput = s[1];
                      if (element.businessObject.$attrs.inputParameter != undefined) {
                        var param = element.businessObject.$attrs.inputParameter;
                        var length = param.length;

                        for (var i = 0; i < length; i++) {
                          if (param[i].name == element.businessObject.$attrs.nameInput) {
                            var split = param[i].value.split(',');
                            if (split.length == 3) {
                              element.businessObject.$attrs.valueInput = split[2];
                            }
                          }
                        }
                      } else {
                        element.businessObject.$attrs.inputParameter = CustomPropsProvider.options;
                        element.businessObject.$attrs.inputParams = values.inputParams;
                        return;
                      }

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
                            //element.businessObject.$attrs.operation = CustomPropsProvider.operations;
                            return CustomPropsProvider.outputParam;
                          }
                        }
                      }
                    }
                    return CustomPropsProvider.outputParam;
                  },
                  setControlValue: true,
                  modelProperty: 'outputParams'
                })
              ]
            }]
        })

    } else if ((element.businessObject.$type == 'bpmn:DataObjectReference') && (element.businessObject.$attrs.dtype == "ServiceInstanceDataObject")) {
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
                  description: 'ServiceInstance ID',
                  label: 'Service Instance ID',
                  modelProperty: 'serviceinstanceID'
                }),
                EntryFactory.textBox({
                  id: 'servicetemplateID',
                  description: 'ServiceTemplate ID',
                  label: 'Service Template ID',
                  modelProperty: 'servicetemplateID',
                  get: function () {
                    element.businessObject.$attrs.servicetemplateID = CustomPropsProvider.winery2.serviceTemplateId;
                    return {
                      servicetemplateID: CustomPropsProvider.winery2.serviceTemplateId
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.servicetemplateID = CustomPropsProvider.winery2.serviceTemplateId;
                    console.log("HIER SET");
                    console.log(element);
                  }
                }),
                EntryFactory.textBox({
                  id: 'CSARID',
                  description: 'CSAR ID',
                  label: 'CSAR ID',
                  modelProperty: 'CSARID',
                  get: function () {
                    element.businessObject.$attrs.CSARID = CustomPropsProvider.winery2.serviceTemplateId + '.csar';
                    return {
                      CSARID: CustomPropsProvider.winery2.serviceTemplateId + '.csar'
                    }
                  },
                  set: function (element, values) {
                    element.businessObject.$attrs.CSARID = CustomPropsProvider.winery2.serviceTemplateId + '.csar';
                  }
                }),

              ]
            }]
        });
    } else if ((element.businessObject.$type == 'bpmn:DataObjectReference') && (element.businessObject.$attrs.dtype == "RelationshipInstanceDataObject")) {
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
                                description: 'RelationshipInstance ID',
                                label: 'Relationship Instance ID',
                                modelProperty: 'relationshipinstanceID'
                            }),
                            EntryFactory.textBox({
                                id: 'SourceURL',
                                description: 'SourceURL',
                                label: 'SourceURL',
                                modelProperty: 'SourceURL'
                            }),
                            EntryFactory.textBox({
                                id: 'TargetURL',
                                description: 'TargetURL',
                                label: 'TargetURL',
                                modelProperty: 'TargetURL'
                            }),

                        ]
                    }]
            });
    } else if ((element.businessObject.$type == 'bpmn:ScriptTask') && (element.businessObject.$attrs.ntype == "StateChanger")) {
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
                                    description: 'State',
                                    label: 'State',
                                    selectOptions: function(element, values) {
                                        if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                                            // Set changed value
                                            if (is(element.businessObject, 'bpmn:ScriptTask')) {
                                                if (element.businessObject.$attrs.ntype === "StateChanger") {
                                                    element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                                                }
                                            }
                                        } else if (values.selectedOptions[0] === undefined) {
                                            // Set default value
                                            if (is(element.businessObject, 'bpmn:ScriptTask')) {
                                                if (element.businessObject.$attrs.ntype === "StateChanger") {
                                                    element.businessObject.extensionElements.values[0].inputParameters[0].value = CustomPropsProvider.opt[0].value;
                                                }
                                            }
                                        }
                                        return CustomPropsProvider.opt;
                                        
                                    },
                                    setControlValue: true,
                                    modelProperty: 'State'
                                }),
                                EntryFactory.textBox({
                                    id: 'RelationshipInstanceID',
                                    description: 'RelationshipInstance ID',
                                    label: 'Relationship Instance ID',
                                    modelProperty: 'relationshipinstanceID'
                                }),

                            ]
                        }]
                });
    } else {
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
