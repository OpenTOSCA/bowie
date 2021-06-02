import { EntryFactory, IPropertiesProvider, } from '../bpmn-js/bpmn-js';
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
  static types = [{ name: 'none', value: 'none' }, { name: 'VALUE', value: 'VALUE' }, { name: 'String', value: 'String' }, { name: 'DA', value: 'DA' }];
  static DA = [{ name: 'none', value: 'none' }];
  static moddle = new BpmnModdle({ camunda: _camundaModdleDescriptor });
  static properties = [];
  static int = [];
  static nodetemplateindex = -1;
  static interfaceindex = -1;
  static machnureinmal = true;

  // Note that names of arguments must match injected modules, see InjectionNames.
  constructor(private translate, private bpmnPropertiesProvider, private httpService: HttpService, private winery: WineryService) {
    // this.update2(CustomPropsProvider.options);
    // this.loadNodeTemplates('http://opentosca.org/servicetemplates', 'MyTinyToDo_Bare_Docker', CustomPropsProvider.template);
    // const url = 'servicetemplates/' + this.encode('http://opentosca.org/servicetemplates')
    //  + '/' + this.encode(CustomPropsProvider.winery2.serviceTemplateId) + '/topologytemplate/';//this.loadNodeTemplateInterfaces('http://opentosca.org/nodetypes', 'http://opentosca.org/nodetypes', CustomPropsProvider.interfaces);



  }

  /**
   * läd alle interfaces 1x
   */
  public async interfaceloadfunction() {
    const namespace = 'http://opentosca.org/nodetypes';
    if (CustomPropsProvider.int.length === 0) {
      for (let k = 0; k < CustomPropsProvider.template.length; k++) {
        if (CustomPropsProvider.template[k].value !== 'none') {
          // wenn iwas nicht geht dann liegt das wahrscheinlich hier !!!
          let tmpval = CustomPropsProvider.template[k].value.split('_')[0];
          let interf = await this.loadinterfacelul2(tmpval, namespace);
          CustomPropsProvider.int.push({ name: CustomPropsProvider.template[k].value, interfaces: interf });
        }
      }
    }
    console.log('inerfaceloadfuinction');
    console.log(CustomPropsProvider.int);
  }

  /**
   * http call zum laden der interfaces
   * @param nodetemplate
   * @param namespace
   */
  public loadinterfacelul2(nodetemplate, namespace) {
    return new Promise(resolve => {

      const url = 'nodetypes/' + encodeURIComponent(encodeURIComponent((namespace)))
        + '/' + encodeURIComponent(encodeURIComponent((nodetemplate))) + '/interfaces/';
      let http2 = new XMLHttpRequest();
      console.log('http://localhost:8080/' + 'winery/' + url);
      http2.open("GET", 'http://localhost:8080/' + 'winery/' + url, true);
      http2.send();
      http2.onreadystatechange = function () {
        if (http2.readyState === XMLHttpRequest.DONE) {

          console.log(http2.responseText);
          var response = JSON.parse(http2.responseText);
          CustomPropsProvider.interfaces = [];
          CustomPropsProvider.tosca = [];
          console.log('JSON PARSE');
          console.log(response);
          // var array = [];

          for (var i = 0; i < response.length; i++) {
            CustomPropsProvider.tosca.push({ name: response[i].name, value: response[i].operation });
            //array.push({
            //    name: response[i].name, value: response[i].name
            //});
            //CustomPropsProvider.interfaces.push({
            //    name: response[i].name, value: response[i].name
            //});

            //window['interfaceN'] = array;
          }
          //element.businessObject.$attrs['qa:interface'] = CustomPropsProvider.interfaces;
          console.log("hier für interfaces checken:");
          console.log(CustomPropsProvider.tosca);
          resolve(CustomPropsProvider.tosca);
        }

      };
    }); // .then(response => {
    //  return response;
    // });
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
    if (CustomPropsProvider.machnureinmal) {
      this.update2(CustomPropsProvider.options);
      // let prom = this.interfaceloadfunction();
      // console.log(prom);
      CustomPropsProvider.machnureinmal = false;
    }
    // this.update2(CustomPropsProvider.options);
    let tmp = this;
    let prom = this.interfaceloadfunction();
    console.log(prom);
    console.log("tosca list");
    console.log(CustomPropsProvider.tosca);
    console.log('templates in array:');
    console.log(CustomPropsProvider.template);
    console.log('interfaces woo');
    console.log(CustomPropsProvider.interfaces);
    console.log("int:");
    console.log(CustomPropsProvider.int);

    if (element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs['qa:ntype'] == "CallNodeOperation") {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Properties'),
          groups: [
            {
              id: 'opProp',
              label: this.translate('Call node operation properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'serviceinstanceID',
                  // description: 'ServiceTemplate ID',
                  label: 'Service Instance ID',
                  modelProperty: 'qa:serviceinstanceID',
                  setControlValue: true,
                  selectOptions: function (element, node) {
                    var serviceInstances = [];
                    serviceInstances.push({ name: 'none', value: 'none' });
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      var length = element.businessObject.$parent.flowElements.length;
                      var flowElement = element.businessObject.$parent.flowElements;
                      for (var i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'ServiceTemplateInstance' && flowElement[i].resultVariable != undefined) {
                          serviceInstances.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }
                      return serviceInstances;
                    }
                  },
                  set: function (element, values, node) {
                    console.log(values['qa:serviceinstanceID'])
                    if (values['qa:serviceinstanceID'] != undefined) {
                      element.businessObject.$attrs['qa:serviceinstanceID'] = values['qa:serviceinstanceID'];
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = "${" + values['qa:serviceinstanceID'] + "}";

                      element.businessObject.$attrs['qa:CSARID'] = CustomPropsProvider.winery2.serviceTemplateId + '.csar';
                      element.businessObject.extensionElements.values[0].inputParameters[1].value = element.businessObject.$attrs['qa:CSARID'];

                      var namespace = "{http://opentosca.org/servicetemplates}"
                      element.businessObject.$attrs['qa:servicetemplateID'] = namespace + CustomPropsProvider.winery2.serviceTemplateId;
                      element.businessObject.extensionElements.values[0].inputParameters[2].value = element.businessObject.$attrs['qa:servicetemplateID'];
                      return;
                    }
                    return;
                  }
                }),
                EntryFactory.selectBox({
                  id: 'NodeTemplate',
                  // description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  selectOptions: function (element, values) {
                    return CustomPropsProvider.template;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    console.log('qa:nodetemplate values:');
                    console.log(values['qa:NodeTemplate'].split('_')[0]);
                    console.log(values);
                    if (values['qa:NodeTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                      element.businessObject.$attrs['qa:interface'] = [];
                      element.businessObject.$attrs['qa:operation'] = [];
                      element.businessObject.$attrs['qa:options'] = [];
                      element.businessObject.$attrs['qa:inputParams'] = [];
                      element.businessObject.$attrs['qa:nameInput'] = [];
                      element.businessObject.$attrs['qa:type2Input'] = 'none';
                      element.businessObject.$attrs['qa:typeInput'] = 'none';
                      element.businessObject.$attrs['qa:outputParams'] = [];
                      CustomPropsProvider.interfaces = [];
                      CustomPropsProvider.operations = [];
                      CustomPropsProvider.options = [];
                      CustomPropsProvider.outputParam = [];
                      CustomPropsProvider.interfaceindex = -1;
                      CustomPropsProvider.nodetemplateindex = -1;

                      if (values['qa:NodeTemplate'] !== undefined) {
                        // inputtests
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
                  // description: 'Interface',
                  label: 'Interface',
                  selectOptions: function (element, values) {

                    if (element.businessObject.$attrs['qa:NodeTemplate'] !== undefined) {
                      // element.businessObject.$attrs.nodetemplate = values.nodetemplate;
                      // console.log(window['interfaceN']);
                      console.log("interface wird jetzt gesetzt");

                      // falls interfaces leer ist wird hier aufgefuellt
                      if ((CustomPropsProvider.int.length > 0) && (CustomPropsProvider.interfaces.length === 0)) {
                        for (let i = 0; i < CustomPropsProvider.int.length; i++) {
                          if (element.businessObject.$attrs['qa:NodeTemplate'] === CustomPropsProvider.int[i].name) {
                            for (let j = 0; j < CustomPropsProvider.int[i].interfaces.length; j++) {
                              CustomPropsProvider.interfaces.push({
                                name: CustomPropsProvider.int[i].interfaces[j].name,
                                value: CustomPropsProvider.int[i].interfaces[j].name
                              });
                              CustomPropsProvider.nodetemplateindex = i;
                            }
                          }
                        }
                      }
                      console.log(CustomPropsProvider.interfaces);
                      return CustomPropsProvider.interfaces;
                    }
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:interface'] = values['qa:interface'];

                    element.businessObject.$attrs['qa:operation'] = [];
                    element.businessObject.$attrs['qa:options'] = [];
                    element.businessObject.$attrs['qa:inputParams'] = [];
                    element.businessObject.$attrs['qa:nameInput'] = [];
                    element.businessObject.$attrs['qa:type2Input'] = 'none';
                    element.businessObject.$attrs['qa:typeInput'] = 'none';
                    element.businessObject.$attrs['qa:outputParams'] = [];
                    CustomPropsProvider.operations = [];
                    CustomPropsProvider.options = [];
                    CustomPropsProvider.outputParam = [];
                    CustomPropsProvider.interfaceindex = -1;
                    // inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                        element.businessObject.extensionElements.values[0].inputParameters[4].value = values['qa:interface'];
                      }
                    }
                    /*
                    if (element.businessObject.$attrs['qa:interface'] !== undefined) {
                      for (let i = 0; i < CustomPropsProvider.interfaces.length; i++) {
                        if (CustomPropsProvider.interfaces[i].name === element.businessObject.$attrs['qa:interface']) {
                            
                          for (let j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                            CustomPropsProvider.operations.push({
                              name: CustomPropsProvider.tosca[i].value[j].name, value:
                                CustomPropsProvider.tosca[i].value[j].name
                            });
                          }

                          element.businessObject.$attrs['qa:operation'] = values['qa:operation'];
                          return;
                        }
                      }
                    }*/
                  },
                  setControlValue: true,
                  modelProperty: 'qa:interface'
                }),
                EntryFactory.selectBox({
                  id: 'operation',
                  // description: 'Operation',
                  label: 'Operation',
                  selectOptions: function (element, values) {
                    console.log("operation wird jetzt gesetzt");
                    console.log(CustomPropsProvider.operations);
                    if (element.businessObject.$attrs['qa:interface'] !== undefined) {
                      if ((CustomPropsProvider.int.length > 0) && (CustomPropsProvider.operations.length === 0) && (CustomPropsProvider.nodetemplateindex !== -1)) {
                        for (let i = 0; i < CustomPropsProvider.interfaces.length; i++) {
                          if (element.businessObject.$attrs['qa:interface'] === CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[i].name) {
                            console.log("check2");
                            for (let j = 0; j < CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[i].value.length; j++) {
                              CustomPropsProvider.operations.push({
                                name: CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[i].value[j].name,
                                value: CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[i].value[j].name
                              });
                              CustomPropsProvider.interfaceindex = i;
                            }
                          }
                        }
                      }
                    }

                    /*
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
                       */
                    return CustomPropsProvider.operations;
                  }, set: function (element, values, node) {
                    console.log(values['qa:operation']);
                    element.businessObject.$attrs['qa:operation'] = values['qa:operation'];

                    element.businessObject.$attrs['qa:options'] = [];
                    element.businessObject.$attrs['qa:inputParams'] = [];
                    element.businessObject.$attrs['qa:nameInput'] = [];
                    element.businessObject.$attrs['qa:type2Input'] = 'none';
                    element.businessObject.$attrs['qa:typeInput'] = 'none';
                    element.businessObject.$attrs['qa:outputParams'] = [];
                    CustomPropsProvider.options = [];
                    CustomPropsProvider.outputParam = [];
                    // inputtests hier
                    if (is(element.businessObject, 'bpmn:ScriptTask')) {
                      if (element.businessObject.$attrs['qa:ntype'] === "CallNodeOperation") {
                        console.log(element.businessObject.$attrs)
                        console.log(element.businessObject.$attrs['qa:ntype'])
                        console.log("inputParams wird jetzt gesetzt");
                        console.log(CustomPropsProvider.options);
                        if (element.businessObject.$attrs['qa:interface'] !== undefined) {
                          if ((CustomPropsProvider.int.length > 0) && (CustomPropsProvider.options.length === 0)
                            && (CustomPropsProvider.nodetemplateindex !== -1) && (CustomPropsProvider.interfaceindex !== -1)) {
                            for (let k = 0; k < CustomPropsProvider.operations.length; k++) {
                              if ((element.businessObject.$attrs['qa:operation'] ===
                                CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[CustomPropsProvider.interfaceindex].value[k].name)
                                && (CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[CustomPropsProvider.interfaceindex].value[k].
                                  hasOwnProperty('inputParameters'))) {
                                for (let l = 0; l < CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].
                                  interfaces[CustomPropsProvider.interfaceindex].value[k].inputParameters.inputParameter.length; l++) {
                                  // warum so und dann splitten??
                                  let parameter = CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].
                                    interfaces[CustomPropsProvider.interfaceindex].value[k].inputParameters.inputParameter;
                                  CustomPropsProvider.options.push({
                                    name: parameter[l].name,
                                    value: parameter[l].name + ',' + parameter[l].type
                                  });
                                }
                              }
                            }
                          }
                        }
                        element.businessObject.$attrs['qa:inputParameter'] = CustomPropsProvider.options;
                        var inputparameters = element.businessObject.$attrs['qa:inputParameter'];
                        console.log(inputparameters)
                        for (var i = 0; i <= inputparameters.length - 1; i++) {
                          let addinput = true;
                          const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                            name: 'Input_' + inputparameters[i].name,
                            value: ''
                          });
                          console.log(inputParameter)
                          for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                            if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                              addinput = false;
                            }
                          }
                          if (addinput) {
                            element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                          } else {
                            addinput = true;
                          }

                        }
                        element.businessObject.extensionElements.values[0].inputParameters[5].value = values['qa:operation'];

                      }
                    }
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:operation'
                }),
                EntryFactory.selectBox({
                  id: 'inputParams',
                  // description: 'Input Parameter',
                  label: 'Input Parameter',
                  selectOptions: function (element) {
                    element.businessObject.$attrs['qa:inputParameter'] = CustomPropsProvider.options;
                    return CustomPropsProvider.options;
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:saveValueCheckbox'] = false;
                    element.businessObject.$attrs['qa:valueInput'] = '';
                    console.log("was ist das?");
                    console.log(values['qa:inputParams'].split(','));

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
                            console.log(split);
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
                  // description: 'Name of Parameter',
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
                    var types = [ { name: 'VALUE', value: 'VALUE' }, { name: 'String', value: 'String' }, { name: 'DA', value: 'DA' }];
                    return types;
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:typeInput'] = values['qa:typeInput'];
                    element.businessObject.$attrs['qa:type2Input'] = values['qa:typeInput'];
                    return;
                  },
                  setControlValue: true,
                  isHidden: true,
                  modelProperty: 'qa:typeInput'
                }),
                EntryFactory.selectBox({
                  id: 'deploymentArtifact',
                  // description: 'Deployment Artifact',
                  label: 'Deployment Artifact',
                  selectOptions: function (element, values) {
                    // element.businessObject.$attrs['qa:deploymentArtifact'] = Cu stomPropsProvider.DA;
                    return CustomPropsProvider.DA;
                  },
                  setControlValue: true,
                  //isHidden: false,
                  //isDisabled: true, 
                  modelProperty: 'qa:deploymentArtifact',
                  hidden: function (element, node) {
                    console.log(element.businessObject.$attrs['qa:type2Input']);
                    if (element.businessObject.$attrs['qa:type2Input'] == 'DA') {
                      return false;
                    } else {
                      return true;
                    }
                  },
                  set: function(element, values, node){
                    element.businessObject.$attrs['qa:deploymentArtifact'] = values['qa:deploymentArtifact'];
                    var name = element.businessObject.$attrs['qa:inputParams'].split(",")[0];
                    for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                      var extensionElement = element.businessObject.extensionElements.values[0].inputParameters[o].name;
                      extensionElement = extensionElement.split('Input_')[1];
                      console.log(name);
                      console.log(extensionElement);
                      if (name === extensionElement) {
                        element.businessObject.extensionElements.values[0].inputParameters[o].value = 'DA!'+ values['qa:deploymentArtifact']
                      }
                    }
                    return;
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
                  hidden: function (element, node) {
                    if (element.businessObject.$attrs['qa:type2Input'] == 'VALUE') {
                      return false;
                    } else {
                      return true;
                    }
                  },
                  modelProperty: 'qa:dataObject',
                }),
                EntryFactory.selectBox({
                  id: 'dataObjectProperties',
                  // description: 'Data Object ID',
                  label: 'Data Object Properties',
                  selectOptions: function (element, values) {
                    console.log("DATATATS");
                    let selectedDataObject = element.businessObject.$attrs['qa:dataObject'];
                    console.log(selectedDataObject)
                    if (selectedDataObject != 'none' && selectedDataObject != undefined) {
                      let dataObjectsList = element.businessObject.$attrs['qa:dataObjectV'];
                      for (let i = 0; i < dataObjectsList.length; i++) {
                        let dataObject = dataObjectsList[i].name.id;
                        console.log(dataObject);
                        console.log(selectedDataObject);
                        if (dataObject == selectedDataObject) {
                          dataObject = dataObjectsList[i].name;
                          console.log(dataObject.$attrs['qa:propertiesList'])
                          if (dataObject.$attrs['qa:propertiesList'] != undefined) {
                            let properties = [{ name: 'none', value: 'none' }];
                            console.log(dataObject.$attrs['qa:propertiesList']);
                            for (let j = 0; j < dataObject.$attrs['qa:propertiesList'].length; j++) {
                              let property = dataObject.$attrs['qa:propertiesList'][j].split('#')[0];
                              properties.push({ name: property, value: property });
                            }
                            return properties;
                          }
                        }
                      }
                      console.log(element.businessObject.$attrs['qa:dataObjectV'])
                      return;
                    }
                  },
                  set: function (element, values) {
                    if (values['qa:dataObjectProperties'] != 'none') {
                      element.businessObject.$attrs['qa:dataObjectProperties'] = values['qa:dataObjectProperties'];
                      var name = element.businessObject.$attrs['qa:inputParams'].split(",")[0];
                      for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                        var extensionElement = element.businessObject.extensionElements.values[0].inputParameters[o].name;
                        extensionElement = extensionElement.split('Input_')[1];
                        console.log(name);
                        console.log(extensionElement);
                        if (name === extensionElement) {
                          var dataObject = element.businessObject.$attrs['qa:dataObject'];
                          element.businessObject.extensionElements.values[0].inputParameters[o].value = 'VALUE!'+ dataObject + '#'+ values['qa:dataObjectProperties']
                        }
                      }
                      element.businessObject.$attrs['qa:dataObjectProperties'] = values['qa:dataObjectProperties'];
                      return;
                    }
                    return
                  },
                  setControlValue: true,
                  hidden: function (element, node) {
                    console.log(element.businessObject.$attrs['qa:dataObject']);
                    if (element.businessObject.$attrs['qa:dataObject'] != 'none' && element.businessObject.$attrs['qa:dataObject'] != undefined) {
                      return false;
                    } else {
                      return true;
                    }
                  },
                  modelProperty: 'qa:dataObjectProperties',
                }),
                EntryFactory.textField({
                  id: 'valueInput',
                  // description: 'Value of Parameter',
                  label: 'Value of Parameter',
                  modelProperty: 'qa:valueInput',
                  hidden: function (element, node) {
                    if (element.businessObject.$attrs['qa:type2Input'] == 'String') {
                      return false;
                    } else {
                      return true;
                    }
                  },
                  set: function(element, values, node){
                    var name = element.businessObject.$attrs['qa:inputParams'].split(",")[0];
                    for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                      var extensionElement = element.businessObject.extensionElements.values[0].inputParameters[o].name;
                      extensionElement = extensionElement.split('Input_')[1];
                      if (name === extensionElement) {
                        element.businessObject.extensionElements.values[0].inputParameters[o].value = 'String!'+values['qa:valueInput']
                      }
                    }
                    element.businessObject.$attrs['qa:valueInput'] = values['qa:valueInput'];
                    return;
                  }
                }),
                EntryFactory.selectBox({
                  id: 'outputParams',
                  // description: 'Output Parameter',
                  label: 'Output Parameter',
                  selectOptions: function (element, values) {
                    /*
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
*/

                    console.log("outputParams wird jetzt gesetzt");
                    console.log(CustomPropsProvider.outputParam);
                    if (element.businessObject.$attrs['qa:interface'] !== undefined) {
                      if ((CustomPropsProvider.int.length > 0) && (CustomPropsProvider.outputParam.length === 0)
                        && (CustomPropsProvider.nodetemplateindex !== -1) && (CustomPropsProvider.interfaceindex !== -1)) {
                        for (let k = 0; k < CustomPropsProvider.operations.length; k++) {
                          if ((element.businessObject.$attrs['qa:operation'] ===
                            CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[CustomPropsProvider.interfaceindex].value[k].name)
                            && (CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].interfaces[CustomPropsProvider.interfaceindex].value[k].
                              hasOwnProperty('outputParameters'))) {
                            for (let l = 0; l < CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].
                              interfaces[CustomPropsProvider.interfaceindex].value[k].outputParameters.outputParameter.length; l++) {
                              // warum so und dann splitten??
                              let outparameter = CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].
                                interfaces[CustomPropsProvider.interfaceindex].value[k].outputParameters.outputParameter;
                              CustomPropsProvider.outputParam.push({
                                name: outparameter[l].name,
                                value: outparameter[l].name + ',' + outparameter[l].type
                              });
                            }
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
        });
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
      {
        return this.bpmnPropertiesProvider.getTabs(element)
          .concat({
            id: 'custom',
            label: this.translate('Properties'),
            groups: [
              {
                id: 'nodeinstanceDataObject',
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
                        console.log("FLOWELEMENT");
                        console.log(flowElement)
                        var arr = [];
                        arr.push({ name: undefined, value: undefined });
                        for (var i = 0; i < length; i++) {
                          console.log(flowElement[i].ntype)
                          if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'NodeInstance' && flowElement[i].resultVariable != undefined) {
                            arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                          }
                        }
                        return arr;
                      }
                    },
                    set: function (element, values, node) {
                      if (is(element.businessObject, 'bpmn:DataObjectReference')) {
                        if (element.businessObject.$attrs['qa:dtype'] === "NodeInstanceDataObject") {
                          element.businessObject.$attrs['qa:instanceID'] = values['qa:instanceID'];
                          element.businessObject.extensionElements.values[0].inputParameters[0].value = values['qa:instanceID'];
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
                        for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                          var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                          if (CustomPropsProvider.properties[i].id == nodetemplate) {
                            var options = [{ name: 'none', value: 'none' }];
                            let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                            properties = JSON.stringify(properties).split(",");
                            console.log(properties)
                            let propertiesList = [];
                            for (let j = 0; j < properties.length; j++) {
                              console.log(j)
                              let property = properties[j].split(':')[0].replace("{", "");
                              console.log(property)
                              if (property.startsWith("\"") && property.endsWith("\"")) {
                                property = property.substring(1, property.length - 1);
                                let addinput = true;
                                var propertyValue = properties[j].substr(properties[j].indexOf(':') + 1).replace("}", "");
                                console.log(propertyValue);
                                if (propertyValue.startsWith("\"") && propertyValue.endsWith("\"")) {
                                  propertyValue = propertyValue.substring(1, propertyValue.length - 1);
                                  const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                                    name: 'Input_' + property,
                                    value: propertyValue
                                  });
                                  console.log(inputParameter)
                                  for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                                    if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                                      addinput = false;
                                    }
                                  }
                                  if (addinput) {
                                    propertiesList.push(property + '#' + propertyValue);
                                    element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                                  } else {
                                    addinput = true;
                                  }
                                }
                              }

                            } element.businessObject.$attrs['qa:propertiesList'] = propertiesList;

                          }
                        }

                        element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:NodeTemplate'];
                        return;
                      }
                      return;
                    }
                  }),
                  EntryFactory.selectBox({
                    id: 'properties',
                    //description: 'NodeTemplate',
                    label: 'Properties',
                    selectOptions: function (element, values) {
                      //console.log(CustomPropsProvider.template);
                      //return CustomPropsProvider.properties;
                      console.log(CustomPropsProvider.properties);
                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        if (CustomPropsProvider.properties[i].id == nodetemplate) {
                          var options = [{ name: 'none', value: 'none' }];
                          let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                          properties = JSON.stringify(properties).split(",");

                          for (let j = 0; j < properties.length; j++) {
                            let property = properties[j].split(':')[0].replace("{", "");
                            if (property.startsWith("\"") && property.endsWith("\"")) {
                              property = property.substring(1, property.length - 1);

                              options.push({ name: property, value: property })
                            }
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
                    hidden: function (element, node) {
                      console.log(element.businessObject.$attrs['qa:Property']);
                      if (element.businessObject.$attrs['qa:Properties'] == 'none' || element.businessObject.$attrs['qa:Properties'] == undefined) {
                        return true;
                      } else {
                        return false;
                      }
                    },
                    get: function (element, values) {
                      console.log(CustomPropsProvider.properties);

                      var propertyName = element.businessObject.$attrs['qa:Properties'];

                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        if (CustomPropsProvider.properties[i].id == nodetemplate) {
                          var options = [{ name: 'none', value: 'none' }];
                          let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                          properties = JSON.stringify(properties).split(",");
                          console.log(properties)
                          for (let j = 0; j < properties.length; j++) {
                            let property = properties[j].split(':', 2)[0].replace("{", "");
                            console.log(property)
                            if (property.startsWith("\"") && property.endsWith("\"")) {
                              console.log("GEHT DAS")
                              property = property.substring(1, property.length - 1);
                              if (property == propertyName) {
                                var propertyValue = properties[j].substr(properties[j].indexOf(':') + 1);;
                                console.log("VAlue");
                                console.log(propertyValue)
                                if (propertyValue.startsWith("\"") && propertyValue.endsWith("\"")) {
                                  propertyValue = propertyValue.substring(1, propertyValue.length - 1);
                                  element.businessObject.$attrs['qa:paramterlist'] = propertyValue;
                                  return {
                                    'qa:valueProp': propertyValue
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      return {
                        'qa:valueProp': ''
                      }
                    },
                  }
                  ),
                ]
              }]
          })
      }
    } else if ((element.businessObject.$type == 'bpmn:ScriptTask') && (element.businessObject.$attrs['qa:dtype'] == "NodeInstanceDataObjectTask")) {
      {
        return this.bpmnPropertiesProvider.getTabs(element)
          .concat({
            id: 'custom',
            label: this.translate('Properties'),
            groups: [
              {
                id: 'nodeinstanceDataObject',
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
                        console.log("FLOWELEMENT");
                        console.log(flowElement)
                        var arr = [];
                        arr.push({ name: undefined, value: undefined });
                        for (var i = 0; i < length; i++) {
                          console.log(flowElement[i].ntype)
                          if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'NodeInstance' && flowElement[i].resultVariable != undefined) {
                            arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                          }
                        }
                        return arr;
                      }
                    },
                    set: function (element, values, node) {
                      if (is(element.businessObject, 'bpmn:ScriptTask')) {
                        if (element.businessObject.$attrs['qa:dtype'] === "NodeInstanceDataObjectTask") {
                          element.businessObject.$attrs['qa:instanceID'] = values['qa:instanceID'];
                          element.businessObject.extensionElements.values[0].inputParameters[0].value = values['qa:instanceID'];
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
                        for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                          var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                          if (CustomPropsProvider.properties[i].id == nodetemplate) {
                            var options = [{ name: 'none', value: 'none' }];
                            let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                            properties = JSON.stringify(properties).split(",");
                            console.log(properties)
                            let propertiesList = [];
                            for (let j = 0; j < properties.length; j++) {
                              console.log(j)
                              let property = properties[j].split(':')[0].replace("{", "");
                              console.log(property)
                              if (property.startsWith("\"") && property.endsWith("\"")) {
                                property = property.substring(1, property.length - 1);
                                let addinput = true;
                                var propertyValue = properties[j].substr(properties[j].indexOf(':') + 1).replace("}", "");
                                console.log(propertyValue);
                                if (propertyValue.startsWith("\"") && propertyValue.endsWith("\"")) {
                                  propertyValue = propertyValue.substring(1, propertyValue.length - 1);
                                  const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                                    name: 'Input_' + property,
                                    value: propertyValue
                                  });
                                  console.log(inputParameter)
                                  for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                                    if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                                      addinput = false;
                                    }
                                  }
                                  if (addinput) {
                                    propertiesList.push(property + '#' + propertyValue);
                                    element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                                  } else {
                                    addinput = true;
                                  }
                                }
                              }

                            } element.businessObject.$attrs['qa:propertiesList'] = propertiesList;

                          }
                        }

                        element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:NodeTemplate'];
                        return;
                      }
                      return;
                    }
                  }),
                  EntryFactory.selectBox({
                    id: 'properties',
                    //description: 'NodeTemplate',
                    label: 'Properties',
                    selectOptions: function (element, values) {
                      //console.log(CustomPropsProvider.template);
                      //return CustomPropsProvider.properties;
                      console.log(CustomPropsProvider.properties);
                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        if (CustomPropsProvider.properties[i].id == nodetemplate) {
                          var options = [{ name: 'none', value: 'none' }];
                          let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                          properties = JSON.stringify(properties).split(",");

                          for (let j = 0; j < properties.length; j++) {
                            let property = properties[j].split(':')[0].replace("{", "");
                            if (property.startsWith("\"") && property.endsWith("\"")) {
                              property = property.substring(1, property.length - 1);

                              options.push({ name: property, value: property })
                            }
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
                    hidden: function (element, node) {
                      console.log(element.businessObject.$attrs['qa:Property']);
                      if (element.businessObject.$attrs['qa:Properties'] == 'none' || element.businessObject.$attrs['qa:Properties'] == undefined) {
                        return true;
                      } else {
                        return false;
                      }
                    },
                    get: function (element, values) {
                      console.log(CustomPropsProvider.properties);

                      var propertyName = element.businessObject.$attrs['qa:Properties'];

                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        if (CustomPropsProvider.properties[i].id == nodetemplate) {
                          var options = [{ name: 'none', value: 'none' }];
                          let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                          properties = JSON.stringify(properties).split(",");
                          console.log(properties)
                          for (let j = 0; j < properties.length; j++) {
                            let property = properties[j].split(':', 2)[0].replace("{", "");
                            console.log(property)
                            if (property.startsWith("\"") && property.endsWith("\"")) {
                              console.log("GEHT DAS")
                              property = property.substring(1, property.length - 1);
                              if (property == propertyName) {
                                var propertyValue = properties[j].substr(properties[j].indexOf(':') + 1);;
                                console.log("VAlue");
                                console.log(propertyValue)
                                if (propertyValue.startsWith("\"") && propertyValue.endsWith("\"")) {
                                  propertyValue = propertyValue.substring(1, propertyValue.length - 1);
                                  element.businessObject.$attrs['qa:paramterlist'] = propertyValue;
                                  return {
                                    'qa:valueProp': propertyValue
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      return {
                        'qa:valueProp': ''
                      }
                    },
                  }
                  ),
                ]
              }]
          })
      }
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
                        element.businessObject.extensionElements.values[0].inputParameters[1].value = "${" + values['qa:instanceID'] + "}";
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
    } else if (element.businessObject.$type == 'bpmn:ScriptTask' && element.businessObject.$attrs['qa:ntype'] === "PropertiesChanger") {
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
                    for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                      var nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                      if (CustomPropsProvider.properties[i].id == nodetemplate) {
                        var options = [{ name: 'none', value: 'none' }];
                        let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                        properties = JSON.stringify(properties).split(",");

                        for (let j = 0; j < properties.length; j++) {
                          let property = properties[j].split(':')[0].replace("{", "");
                          if (property.startsWith("\"") && property.endsWith("\"")) {
                            property = property.substring(1, property.length - 1);
                          }
                          options.push({ name: property, value: property });
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
                  hidden: function (element, node) {
                    console.log(element.businessObject.$attrs['qa:Property']);
                    if (element.businessObject.$attrs['qa:Properties'] == 'none' || element.businessObject.$attrs['qa:Properties'] == undefined) {
                      return true;
                    } else {
                      return false;
                    }
                  }, set: function (element, values) {
                    var propertyName = element.businessObject.$attrs['qa:Properties'];
                    if (propertyName != '') {
                      if (values['qa:valueProps'] != undefined || values['qa:valueProps'] != '') {
                        console.log(propertyName);
                        const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                          name: 'Input_' + propertyName,
                          value: values['qa:valueProp']
                        });
                        let addinput = true;
                        for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                          if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                            // updates den Wert bei Veränderung, übernimmt aber keine Änderungen aus dem Inputvariabelfeld
                            element.businessObject.extensionElements.values[0].inputParameters[o].value = values['qa:valueProp']
                            addinput = false;
                          }
                        }
                        // verhindert das es immer wieder neue doppelte inputparameter erstellt
                        if (addinput) {
                          element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                        } else {
                          addinput = true;
                        }
                        element.businessObject.$attrs['qa:valueProp'] = values['qa:valueProp'];
                        console.log(values['qa:valueProp']);
                        return;
                      }
                      return;
                    }

                  },
                }),
              ]
            }]
        })
    }
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
