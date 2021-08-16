import { EntryFactory, IPropertiesProvider, } from '../bpmn-js/bpmn-js';
import _camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";
import BpmnModdle from 'bpmn-moddle';
import { HttpService } from '../util/http.service';
import { NodeTemplate } from '../model/nodetemplate';
import { map } from 'rxjs/internal/operators';
import { WineryService } from '../services/winery.service';
import { Injectable } from '@angular/core';
import { is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * !!! If you want to add new attributes to objects you need to add a customized prefix otherwise the Camunda Engine will throw an error.
 */
@Injectable()
export class CustomPropsProvider implements IPropertiesProvider {

  static $inject = ['translate', 'bpmnPropertiesProvider'];
  static options = [];
  static outputParam = [];
  static interfaces = [{ name: 'none', value: 'none' }];
  static operations = [];
  static template = [{ name: 'none', value: 'none' }];
  static relationshiptemplate = [{ name: 'none', value: 'none' }];
  static winery2: WineryService;
  static tosca = [];
  static opt = [{ name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
  { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
  { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
  static types = [{ name: 'none', value: 'none' }, { name: 'VALUE', value: 'VALUE' }, { name: 'String', value: 'String' }, { name: 'DA', value: 'DA' }];
  static DA = [{ name: 'none', value: 'none' }];
  static moddle = new BpmnModdle({ camunda: _camundaModdleDescriptor });
  static references = [];
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
      http2.open("GET", 'http://localhost:8080/' + 'winery/' + url, true);
      http2.send();
      http2.onreadystatechange = function () {
        if (http2.readyState === XMLHttpRequest.DONE) {
          let response = JSON.parse(http2.responseText);
          CustomPropsProvider.interfaces = [];
          CustomPropsProvider.tosca = [];
          for (let i = 0; i < response.length; i++) {
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
          //console.log("hier für interfaces checken:");
          //console.log(CustomPropsProvider.tosca);
          resolve(CustomPropsProvider.tosca);
        }

      };
    }); // .then(response => {
    //  return response;
    // });
  }

  public async update2(selectOptions) {
    let template = await this.loadNodeTemplates(CustomPropsProvider.template);
  }

  public async loadNodeTemplates(options) {
    if (CustomPropsProvider.winery2 != undefined) {
      CustomPropsProvider.winery2.loadNodeTemplates();
      let httpService = CustomPropsProvider.winery2.httpService;
      //console.log('Service', httpService);
      const url = 'servicetemplates/' + this.encode('http://opentosca.org/servicetemplates')
        + '/' + this.encode('MyTinyToDo_Bare_Docker') + '/topologytemplate/';

      if (httpService != undefined) {
        return httpService.get(this.getFullUrl(url))
          .pipe(map(await this.transferResponse2NodeTemplate));
      }
    }
  }


  private transferResponse2NodeTemplate(response: any) {
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
                    let serviceInstances = [];
                    serviceInstances.push({ name: 'none', value: 'none' });
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      for (let i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'ServiceTemplateInstance' && flowElement[i].resultVariable != undefined) {
                          serviceInstances.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }
                      return serviceInstances;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:serviceinstanceID'] != 'none') {
                      element.businessObject.$attrs['qa:serviceinstanceID'] = values['qa:serviceinstanceID'];
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = "${" + values['qa:serviceinstanceID'] + "}";

                      element.businessObject.$attrs['qa:CSARID'] = CustomPropsProvider.winery2.serviceTemplateId + '.csar';
                      element.businessObject.extensionElements.values[0].inputParameters[1].value = element.businessObject.$attrs['qa:CSARID'];

                      let namespace = "{http://opentosca.org/servicetemplates}"
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
                      for (let i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs['qa:interface']) {
                          CustomPropsProvider.operations = [];
                          let arr = [];
                          CustomPropsProvider.operations.push({ name: 'none', value: 'none' });
                          for (let j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
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

                        let inputparameters = element.businessObject.$attrs['qa:inputParameter'];
                        console.log(inputparameters)
                        for (let o = element.businessObject.extensionElements.values[0].inputParameters.length - 1; o >= 0; o--) {
                          if (element.businessObject.extensionElements.values[0].inputParameters[o].name.startsWith('Input_')) {

                            element.businessObject.extensionElements.values[0].inputParameters.pop();
                          }
                        }
                        for (let i = 0; i <= inputparameters.length - 1; i++) {
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
                      let s = values['qa:inputParams'].split(',');
                      element.businessObject.$attrs['qa:nameInput'] = s[0];
                      element.businessObject.$attrs['qa:typeInput'] = s[1];
                      console.log('TEST');
                      console.log(element.businessObject.$attrs['qa:inputParameter']);
                      if (element.businessObject.$attrs['qa:inputParameter'] != undefined) {
                        let param = element.businessObject.$attrs['qa:inputParameter'];
                        let length = param.length;

                        for (let i = 0; i < length; i++) {
                          console.log(param[i].name == element.businessObject.$attrs['qa:nameInput']);
                          if (param[i].name == element.businessObject.$attrs['qa:nameInput']) {
                            let split = param[i].value.split(',');
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
                    let types = [{ name: '', value: '' }, { name: 'VALUE', value: 'VALUE' }, { name: 'String', value: 'String' }, { name: 'DA', value: 'DA' }];
                    return types;
                  },
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:typeInput'] = values['qa:typeInput'];
                    element.businessObject.$attrs['qa:type2Input'] = values['qa:typeInput'];
                    element.businessObject.$attrs['qa:dataObject'] = 'none';
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
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:deploymentArtifact'] = values['qa:deploymentArtifact'];
                    let name = element.businessObject.$attrs['qa:inputParams'].split(",")[0];
                    let reference = '';
                    let fileName = '';
                    for (let d = 0; d < CustomPropsProvider.references.length; d++) {
                      reference = CustomPropsProvider.references[d];
                      let da = values['qa:deploymentArtifact'];
                      if (reference.includes(da)) {
                        let index = reference.lastIndexOf('/');
                        fileName = reference.substring(index + 1);
                      }
                    }
                    for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                      let extensionElement = element.businessObject.extensionElements.values[0].inputParameters[o].name;
                      extensionElement = extensionElement.split('Input_')[1];
                      if (name === extensionElement) {
                        element.businessObject.extensionElements.values[0].inputParameters[o].value = 'DA!' + values['qa:deploymentArtifact'] + '#' + fileName;
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
                    let arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    let saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      for (let i = 0; i < length; i++) {
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
                        let dataObject = element.businessObject.$attrs['qa:dataObjectV'];
                        for (let i = 0; i < dataObject.length; i++) {
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
                          console.log(dataObject.$attrs)
                          if (dataObject.$attrs['qa:propertiesList'] != undefined) {
                            let properties = [{ name: '', value: '' }];
                            console.log(dataObject.$attrs['qa:propertiesList']);
                            for (let j = 0; j <= dataObject.$attrs['qa:propertiesList']; j++) {
                              let property = dataObject.$attrs['qa:prop' + j];
                              // Format: propery#propertyValue
                              property = property.split('#')[0];
                              properties.push({ name: property, value: property });
                            }
                            return properties;
                          }
                        }
                      }
                      return;
                    }
                  },
                  set: function (element, values) {
                    if (values['qa:dataObjectProperties'] != 'none') {
                      element.businessObject.$attrs['qa:dataObjectProperties'] = values['qa:dataObjectProperties'];
                      let name = element.businessObject.$attrs['qa:inputParams'].split(",")[0];
                      for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                        let extensionElement = element.businessObject.extensionElements.values[0].inputParameters[o].name;
                        extensionElement = extensionElement.split('Input_')[1];
                        console.log(name);
                        console.log(extensionElement);
                        if (name === extensionElement) {
                          let dataObject = element.businessObject.$attrs['qa:dataObject'];
                          element.businessObject.extensionElements.values[0].inputParameters[o].value = 'VALUE!' + dataObject + '#' + values['qa:dataObjectProperties']
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
                  set: function (element, values, node) {
                    let name = element.businessObject.$attrs['qa:inputParams'].split(",")[0];
                    for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                      let extensionElement = element.businessObject.extensionElements.values[0].inputParameters[o].name;
                      extensionElement = extensionElement.split('Input_')[1];
                      if (name === extensionElement) {
                        element.businessObject.extensionElements.values[0].inputParameters[o].value = 'String!' + values['qa:valueInput']
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

                              let outparameter = CustomPropsProvider.int[CustomPropsProvider.nodetemplateindex].
                                interfaces[CustomPropsProvider.interfaceindex].value[k].outputParameters.outputParameter;
                              CustomPropsProvider.outputParam.push({
                                name: outparameter[l].name,
                                value: outparameter[l].name + ',' + outparameter[l].type
                              });


                              let addinput = true;
                              const inputParameter = CustomPropsProvider.moddle.create('camunda:OutputParameter', {
                                name: 'Output_' + outparameter[l].name,
                                value: ''
                              });
                              console.log(inputParameter)

                              for (let o = 0; o < element.businessObject.extensionElements.values[0].outputParameters.length; o++) {
                                if (inputParameter.name === element.businessObject.extensionElements.values[0].outputParameters[o].name) {
                                  addinput = false;
                                }
                              }
                              if (addinput) {
                                element.businessObject.extensionElements.values[0].outputParameters.push(inputParameter);
                              } else {
                                addinput = true;
                              }

                            }
                          }
                        }

                      }
                    }
                    element.businessObject.extensionElements.values[0].inputParameters[8].value = '';
                    if (CustomPropsProvider.outputParam.length - 1 >= 0) {
                      for (let o = 0; o < CustomPropsProvider.outputParam.length - 1; o++) {
                        element.businessObject.extensionElements.values[0].inputParameters[8].value += CustomPropsProvider.outputParam[o].name + ',';
                      }
                      let lastEntryIndex = CustomPropsProvider.outputParam.length - 1;
                      element.businessObject.extensionElements.values[0].inputParameters[8].value += CustomPropsProvider.outputParam[lastEntryIndex].name;

                      //element.businessObject.$attrs['qa:outputParams'] = CustomPropsProvider.outputParam;
                    }
                    return CustomPropsProvider.outputParam;
                  },
                  set: function (element, values, node) {
                    if (values['qa:outputParams'] != 'none') {
                      element.businessObject.$attrs['qa:outputParams'] = values['qa:outputParams'];
                      return;
                    }
                  },
                  setControlValue: true,
                  modelProperty: 'qa:outputParams'
                }),
                EntryFactory.selectBox({
                  id: 'dataObject2',
                  //description: 'Data Object ID',
                  label: 'Map to Data Object',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    let arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    let saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      for (let i = 0; i < length; i++) {
                        if (flowElement[i].$type == 'bpmn:DataObjectReference') {
                          arr.push({ name: flowElement[i].id, value: flowElement[i].id });
                          saveDataObject.push({ name: flowElement[i], value: flowElement[i] });
                        }
                      }
                      element.businessObject.$attrs['qa:dataObjectV2'] = saveDataObject;
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:dataObject2'] != 'none') {
                      element.businessObject.$attrs['qa:dataObject2'] = values['qa:dataObject2'];
                      if (element.businessObject.$attrs['qa:dataObjectV2'] != undefined) {
                        let dataObject = element.businessObject.$attrs['qa:dataObjectV2'];
                        for (let i = 0; i < dataObject.length; i++) {
                          if (dataObject[i].name.id == element.businessObject.$attrs['qa:dataObject2']) {
                            element.businessObject.$attrs['qa:dataObject02'] = dataObject[i].value;
                          }
                        }
                      }
                      return;
                    }
                  },
                  setControlValue: true,

                  modelProperty: 'qa:dataObject2',
                }),
                EntryFactory.selectBox({
                  id: 'dataObjectProperties2',
                  // description: 'Data Object ID',
                  label: 'Map to Data Object Properties',
                  selectOptions: function (element, values) {
                    console.log("DATATATS");
                    let selectedDataObject = element.businessObject.$attrs['qa:dataObject2'];
                    console.log(selectedDataObject)
                    if (selectedDataObject != 'none' && selectedDataObject != undefined) {
                      let dataObjectsList = element.businessObject.$attrs['qa:dataObjectV2'];
                      for (let i = 0; i < dataObjectsList.length; i++) {
                        let dataObject = dataObjectsList[i].name.id;
                        console.log(dataObject);
                        console.log(selectedDataObject);
                        if (dataObject == selectedDataObject) {
                          dataObject = dataObjectsList[i].name;
                          console.log(dataObject.$attrs)
                          if (dataObject.$attrs['qa:propertiesList'] != undefined) {
                            let properties = [{ name: '', value: '' }];
                            console.log(dataObject.$attrs['qa:propertiesList']);
                            for (let j = 0; j <= dataObject.$attrs['qa:propertiesList']; j++) {
                              let property = dataObject.$attrs['qa:prop' + j];
                              // Format: propery#propertyValue
                              property = property.split('#')[0];
                              properties.push({ name: property, value: property });
                            }
                            return properties;
                          }
                        }
                      }
                      return;
                    }
                  },
                  set: function (element, values) {
                    if (values['qa:dataObjectProperties2'] != 'none') {
                      element.businessObject.$attrs['qa:dataObjectProperties2'] = values['qa:dataObjectProperties2'];
                      let name = element.businessObject.$attrs['qa:outputParams'].split(",")[0];
                      for (let o = 0; o < element.businessObject.extensionElements.values[0].outputParameters.length; o++) {
                        let extensionElement = element.businessObject.extensionElements.values[0].outputParameters[o].name;
                        extensionElement = extensionElement.split('Output_')[1];
                        console.log(name);
                        console.log(extensionElement);
                        if (name === extensionElement) {
                          let dataObject = element.businessObject.$attrs['qa:dataObject2'];
                          element.businessObject.extensionElements.values[0].outputParameters[o].value = 'VALUE!' + dataObject + '#' + values['qa:dataObjectProperties2']
                        }
                      }
                      element.businessObject.$attrs['qa:dataObjectProperties2'] = values['qa:dataObjectProperties2'];
                      return;
                    }
                    return
                  },
                  setControlValue: true,
                  hidden: function (element, node) {
                    console.log(element.businessObject.$attrs['qa:dataObject2']);
                    if (element.businessObject.$attrs['qa:dataObject2'] != 'none' && element.businessObject.$attrs['qa:dataObject2'] != undefined) {
                      return false;
                    } else {
                      return true;
                    }
                  },
                  modelProperty: 'qa:dataObjectProperties2',
                }),
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
                    let arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    let saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      for (let i = 0; i < length; i++) {
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
                        let dataObject = element.businessObject.$attrs.dataObjectV;
                        console.log(element.businessObject.$attrs.dataObjectV);
                        for (let i = 0; i < dataObject.length; i++) {
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
                      let arr = [];
                      if (element.businessObject.$attrs.dataObject0.$attrs.inputParameter != undefined) {
                        for (let i = 0; i < element.businessObject.$attrs.dataObject0.$attrs.inputParameter.length; i++) {
                          arr.push({
                            name: element.businessObject.$attrs.dataObject0.$attrs.inputParameter[i].value,
                            value: element.businessObject.$attrs.dataObject0.$attrs.inputParameter[i].value
                          })
                        }

                        if (element.businessObject.$attrs.ntype === "CallNodeOperation") {
                          let names = [];
                          let valuesInput = [];
                          let param = element.businessObject.$attrs.dataObject0.$attrs.inputParameter;
                          for (let i = 0; i < element.businessObject.$attrs.dataObject0.$attrs.inputParameter.length; i++) {

                            let split = param[i].value.split(',');
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
                    let check = values.saveValueCheckbox;
                    console.log('VALUE OF INPUT PARAM');
                    console.log(values);
                    if (element.businessObject.$attrs.valueInput != undefined && check) {
                      if (element.businessObject.$attrs.inputParameter != undefined) {
                        let length = element.businessObject.$attrs.inputParameter.length;
                        for (let i = 0; i < length; i++) {

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
                      for (let i = 0; i < CustomPropsProvider.tosca.length; i++) {
                        if (CustomPropsProvider.tosca[i].name == element.businessObject.$attrs.interface) {
                          CustomPropsProvider.outputParam = [];
                          let arr = [];
                          if (element.businessObject.$attrs.operation != undefined) {
                            for (let j = 0; j < CustomPropsProvider.tosca[i].value.length; j++) {
                              if (element.businessObject.$attrs.operation != 'none') {
                                if (CustomPropsProvider.tosca[i].value[j].name == element.businessObject.$attrs.operation) {
                                  console.log('OUTPUT PARAMETER')
                                  if (CustomPropsProvider.tosca[i].value[j].outputParameters != undefined) {
                                    let parameter = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter;
                                    if (parameter != undefined) {
                                      let length = CustomPropsProvider.tosca[i].value[j].outputParameters.outputParameter.length;
                                      for (let k = 0; k < length; k++) {
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
              label: this.translate('Create NodeTemplateInstance Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'State',
                  //description: 'State',
                  label: 'State',
                  selectOptions: function (element, values) {
                    let opt = [{ name: '', value: '' }, { name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
                    { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
                    { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
                    if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                    }
                    return opt;

                  },
                  setControlValue: true,
                  modelProperty: 'qa:State'
                }),
                EntryFactory.selectBox({
                  id: 'NodeTemplate',
                  //description: 'NodeTemplate',
                  label: 'NodeTemplate',
                  selectOptions: function (element, values) {

                    let arr = [];
                    // 
                    let nodeTemplate = element.businessObject.extensionElements.values[0].inputParameters[1].value;

                    for (let i = 0; i < CustomPropsProvider.template.length; i++) {
                      let template = CustomPropsProvider.template[i].name;
                      //template = template.split('_')[0];
                      arr.push({ name: template, value: template });
                    }
                    if (nodeTemplate != undefined) {
                      element.businessObject.$attrs['qa:NodeTemplate'] = nodeTemplate;

                    }
                    return arr;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    if (values['qa:NodeTemplate'] != '') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                      element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:NodeTemplate'];
                      return;
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
              label: this.translate('Create ServiceTemplateInstance Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'State',
                  //description: 'State',
                  label: 'State',
                  selectOptions: function (element, values) {
                    let opt = [{ name: '', value: '' }, { name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
                    { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
                    { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
                    if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                    }
                    return opt;

                  },
                  setControlValue: true,
                  modelProperty: 'qa:State'
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
              label: this.translate('Create RelationshipTemplateInstance Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'State',
                  //description: 'State',
                  label: 'State',
                  selectOptions: function (element, values) {
                    let opt = [{ name: '', value: '' }, { name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
                    { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
                    { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
                    if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                    }
                    return opt;

                  },
                  setControlValue: true,
                  modelProperty: 'qa:State'
                }),
                /**
                 * 
                EntryFactory.selectBox({
                  id: 'dataObject',
                  //description: 'Data Object ID',
                  label: 'Data Object ID',
                  selectOptions: function (element, values) {
                    //console.log(CustomPropsProvider.template);
                    console.log(element);
                    console.log('DATAOBJECT');
                    let arr = [];
                    arr.push({ name: 'none', value: 'none' });
                    let saveDataObject = [];
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      for (let i = 0; i < length; i++) {
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
                        let dataObject = element.businessObject.$attrs['qa:dataObjectV'];
                        console.log(element.businessObject.$attrs['qa:dataObjectV']);
                        for (let i = 0; i < dataObject.length; i++) {
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
                 */
                EntryFactory.selectBox({
                  id: 'RelationshipTemplate',
                  //description: 'State',
                  label: 'RelationshipTemplate',
                  selectOptions: function (element, values) {
                    return CustomPropsProvider.relationshiptemplate;
                  },
                  set: function (element, values, node) {
                    if (values['qa:RelationshipTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:RelationshipTemplate'] = values['qa:RelationshipTemplate'];
                      element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:RelationshipTemplate'];
                      return;
                    }
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:RelationshipTemplate'
                }),
                EntryFactory.selectBox({
                  id: 'SourceURL',
                  //description: 'State',
                  label: 'SourceURL',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      console.log("FLOWELEMENT");
                      console.log(flowElement)
                      let arr = [];
                      arr.push({ name: 'none', value: 'none' });
                      for (let i = 0; i < length; i++) {
                        console.log(flowElement[i].ntype)
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'NodeInstance' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }

                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:SourceURL'] != 'none') {
                      element.businessObject.$attrs['qa:SourceURL'] = values['qa:SourceURL'];
                      element.businessObject.extensionElements.values[0].inputParameters[2].value = '${' + values['qa:SourceURL'] + '}';
                      return;
                    }
                    element.businessObject.extensionElements.values[0].inputParameters[2].value = '';
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:SourceURL'
                }),
                EntryFactory.selectBox({
                  id: 'TargetURL',
                  //description: 'State',
                  label: 'TargetURL',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      console.log("FLOWELEMENT");
                      console.log(flowElement)
                      let arr = [];
                      arr.push({ name: 'none', value: 'none' });
                      for (let i = 0; i < length; i++) {
                        console.log(flowElement[i].ntype)
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'NodeInstance' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:TargetURL'] != 'none') {
                      element.businessObject.$attrs['qa:TargetURL'] = values['qa:TargetURL'];
                      element.businessObject.extensionElements.values[0].inputParameters[3].value = '${' + values['qa:TargetURL'] + '}';
                      return;
                    }
                    element.businessObject.extensionElements.values[0].inputParameters[3].value = '';
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:TargetURL'
                })
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
                label: this.translate('Node Instance Data Object Properties'),
                entries: [
                  EntryFactory.selectBox({
                    id: 'InstanceID',
                    //description: 'Instance ID',
                    label: 'Instance ID',
                    selectOptions: function (element, values) {
                      if (element.businessObject.$parent.$type == 'bpmn:Process') {
                        let find = false;
                        // entspricht der Participant Id, indem ich mich gerade befinde.
                        let length = element.businessObject.$parent.flowElements.length;
                        let flowElement = element.businessObject.$parent.flowElements;
                        console.log("FLOWELEMENT");
                        console.log(flowElement)
                        let arr = [];
                        arr.push({ name: undefined, value: undefined });
                        for (let i = 0; i < length; i++) {
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
                          element.businessObject.$attrs['qa:customPropertiesList'] = 0;
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
                        // removes old input_ parameters
                        for (let o = element.businessObject.extensionElements.values[0].inputParameters.length - 1; o >= 0; o--) {
                          if (element.businessObject.extensionElements.values[0].inputParameters[o].name.startsWith('Input_')) {
                            element.businessObject.extensionElements.values[0].inputParameters.pop();
                          }
                        }
                        for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                          let nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                          if (CustomPropsProvider.properties[i].id == nodetemplate) {
                            let options = [{ name: 'none', value: 'none' }];
                            let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                            properties = JSON.stringify(properties).split(",");
                            console.log(properties)
                            let propertiesList = 0;
                            for (let j = 0; j < properties.length; j++) {
                              console.log(j)
                              let property = properties[j].split(':')[0].replace("{", "");
                              console.log(property)
                              if (property.startsWith("\"") && property.endsWith("\"")) {
                                property = property.substring(1, property.length - 1);
                                let addinput = true;
                                console.log(property);
                                let propertyValue = properties[j].substr(properties[j].indexOf(':') + 1).replace("}", "");
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
                                    // necessary because we cannot save arrays correct
                                    element.businessObject.$attrs['qa:prop' + j] = property + '#' + propertyValue;
                                    console.log(element.businessObject.$attrs['qa:prop' + i]);

                                    element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                                  } else {
                                    addinput = true;
                                  }
                                }
                              }

                            } element.businessObject.$attrs['qa:propertiesList'] = properties.length - 1;

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
                      let options = [{ name: 'none', value: 'none' }];
                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        let nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        if (CustomPropsProvider.properties[i].id == nodetemplate) {

                          let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                          properties = JSON.stringify(properties).split(",");
                          console.log("PROPERTIES");
                          console.log()
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
                      let length = element.businessObject.$attrs['qa:customPropertiesList'];
                          console.log(length)
                      for(let k=0; k < length; k++){
                        let customProp = element.businessObject.$attrs['qa:customProp'+ k]; 
                        console.log(customProp);
                        options.push({ name: customProp, value: customProp });
                        const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                          name: 'Input_' + customProp,
                          value: ''
                        });
                        let addInput = true;
                        for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                          console.log(element.businessObject.extensionElements.values[0].inputParameters[o].name);
                         
                          if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                            addInput = false;
                          }
                        }
  
                        if (addInput) {
                          console.log("test")
                          element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                        } else {
                          addInput = true;
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

                      let propertyName = element.businessObject.$attrs['qa:Properties'];

                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        let nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        if (CustomPropsProvider.properties[i].id == nodetemplate) {
                          let options = [{ name: 'none', value: 'none' }];
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
                                let propertyValue = properties[j].substr(properties[j].indexOf(':') + 1);;
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
                  }),
                  EntryFactory.textField({
                    id: 'customProp',
                    //description: 'Value of Parameter',
                    label: 'Name of custom property',
                    modelProperty: 'qa:customProp', 
                  }),
                  EntryFactory.checkbox({
                    id: 'saveValueCheckbox',
                    description: 'Save this parameter as custom property.',
                    //label: 'Save',
                    modelProperty: 'qa:saveValueCheckbox',
                    set: function (element, values) {
                      let check = values['qa:saveValueCheckbox'];
                      element.businessObject.$attrs['qa:saveValueCheckbox'] = check;
                      let addInput = true;
                      console.log(check);
                      let nameProp = element.businessObject.$attrs['qa:customProp'];
                      if(nameProp != undefined || nameProp == ''){
                      const inputParameter = CustomPropsProvider.moddle.create('camunda:InputParameter', {
                        name: 'Input_' + nameProp,
                        value: ''
                      });
                      for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                        console.log(element.businessObject.extensionElements.values[0].inputParameters[o].name);
                        console.log(nameProp);
                        if (inputParameter.name === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                          addInput = false;
                        }
                      }

                      if (addInput) {
                        element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);

                        
                        let pos = element.businessObject.$attrs['qa:customPropertiesList'];
                        element.businessObject.$attrs['qa:customProp'+ pos] = nameProp;
                        element.businessObject.$attrs['qa:Properties'] = '';
                        element.businessObject.$attrs['qa:customPropertiesList'] +=1;

                      } else {
                        addInput = true;
                      }
                      
                      
                      //element.businessObject.$attrs['qa:saveValueCheckbox'] = false;
                    
                      

                    }}
                  }),
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
                label: this.translate('Data Object Task Properties'),
                entries: [
                  EntryFactory.selectBox({
                    id: 'InstanceID',
                    //description: 'Instance ID',
                    label: 'Instance ID',
                    selectOptions: function (element, values) {
                      if (element.businessObject.$parent.$type == 'bpmn:Process') {
                        let find = false;
                        // entspricht der Participant Id, indem ich mich gerade befinde.
                        let length = element.businessObject.$parent.flowElements.length;
                        let flowElement = element.businessObject.$parent.flowElements;
                        console.log("FLOWELEMENT");
                        console.log(flowElement)
                        let arr = [];
                        arr.push({ name: undefined, value: undefined });
                        for (let i = 0; i < length; i++) {
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
                    id: 'dataObject',
                    //description: 'Data Object ID',
                    label: 'Data Object ID',
                    selectOptions: function (element, values) {
                      //console.log(CustomPropsProvider.template);
                      let arr = [];
                      arr.push({ name: 'none', value: 'none' });
                      let saveDataObject = [];
                      if (element.businessObject.$parent.$type == 'bpmn:Process') {
                        let find = false;
                        // entspricht der Participant Id, indem ich mich gerade befinde.
                        let length = element.businessObject.$parent.flowElements.length;
                        let flowElement = element.businessObject.$parent.flowElements;
                        for (let i = 0; i < length; i++) {
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
                      console.log(values['qa:dataObject']);
                      if (values['qa:dataObject'] != 'none') {
                        element.businessObject.$attrs['qa:dataObject'] = values['qa:dataObject'];
                        if (element.businessObject.$attrs['qa:dataObjectV'] != undefined) {
                          let dataObject = element.businessObject.$attrs['qa:dataObjectV'];
                          for (let i = 0; i < dataObject.length; i++) {
                            if (dataObject[i].name.id == element.businessObject.$attrs['qa:dataObject']) {
                              element.businessObject.$attrs['qa:dataObject0'] = dataObject[i].value;

                            }
                          }
                        }
                        element.businessObject.extensionElements.values[0].inputParameters[1].value = values['qa:dataObject'];
                        return;
                      }

                    },
                    setControlValue: true,
                    hidden: function (element, node) {
                      if (element.businessObject.$attrs['qa:type2Input'] == 'VALUE') {
                        return false;
                      } else {
                        return false;
                      }
                    },
                    modelProperty: 'qa:dataObject',
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
                        // removes old input_ parameters
                        for (let o = element.businessObject.extensionElements.values[0].inputParameters.length - 1; o >= 0; o--) {
                          if (element.businessObject.extensionElements.values[0].inputParameters[o].name.startsWith('Input_')) {
                            element.businessObject.extensionElements.values[0].inputParameters.pop();
                          }
                        }
                        for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                          let nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                          if (CustomPropsProvider.properties[i].id == nodetemplate) {
                            let options = [{ name: 'none', value: 'none' }];
                            let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                            properties = JSON.stringify(properties).split(",");
                            console.log(properties)
                            let propertiesList = 0;
                            for (let j = 0; j < properties.length; j++) {
                              console.log(j)
                              let property = properties[j].split(':')[0].replace("{", "");
                              console.log(property)
                              if (property.startsWith("\"") && property.endsWith("\"")) {
                                property = property.substring(1, property.length - 1);
                                let addinput = true;
                                console.log(property);
                                let propertyValue = properties[j].substr(properties[j].indexOf(':') + 1).replace("}", "");
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
                                    // necessary because we cannot save arrays correct
                                    element.businessObject.$attrs['qa:prop' + j] = property + '#' + propertyValue;
                                    console.log(element.businessObject.$attrs['qa:prop' + i]);

                                    element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                                  } else {
                                    addinput = true;
                                  }
                                }
                              }

                            } element.businessObject.$attrs['qa:propertiesList'] = properties.length - 1;

                          }
                        }

                        element.businessObject.extensionElements.values[0].inputParameters[2].value = values['qa:NodeTemplate'];
                        return;
                      }
                      return;
                    }
                  })
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
                  id: 'RelationshipInstanceURL',
                  //description: 'State',
                  label: 'RelationshipInstanceURL',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      console.log("FLOWELEMENT");
                      console.log(flowElement)
                      let arr = [];
                      arr.push({ name: 'none', value: 'none' });
                      for (let i = 0; i < length; i++) {
                        console.log(flowElement[i].ntype)
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'RelationshipInstance' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }

                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:RelationshipInstanceURL'] != 'none') {
                      element.businessObject.$attrs['qa:RelationshipInstanceURL'] = values['qa:RelationshipInstanceURL'];
                      element.businessObject.extensionElements.values[0].inputParameters[2].value = values['qa:RelationshipInstanceURL'];
                      return;
                    }
                    element.businessObject.extensionElements.values[0].inputParameters[2].value = '';
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:RelationshipInstanceURL'
                }),
                EntryFactory.selectBox({
                  id: 'SourceURL',
                  //description: 'State',
                  label: 'SourceURL',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      console.log("FLOWELEMENT");
                      console.log(flowElement)
                      let arr = [];
                      arr.push({ name: 'none', value: 'none' });
                      for (let i = 0; i < length; i++) {
                        console.log(flowElement[i].ntype)
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'NodeInstance' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }

                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:SourceURL'] != 'none') {
                      element.businessObject.$attrs['qa:SourceURL'] = values['qa:SourceURL'];
                      element.businessObject.extensionElements.values[0].inputParameters[2].value = values['qa:SourceURL'];
                      return;
                    }
                    element.businessObject.extensionElements.values[0].inputParameters[2].value = '';
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:SourceURL'
                }),
                EntryFactory.selectBox({
                  id: 'TargetURL',
                  //description: 'State',
                  label: 'TargetURL',
                  selectOptions: function (element, values) {
                    if (element.businessObject.$parent.$type == 'bpmn:Process') {
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      console.log("FLOWELEMENT");
                      console.log(flowElement)
                      let arr = [];
                      arr.push({ name: 'none', value: 'none' });
                      for (let i = 0; i < length; i++) {
                        console.log(flowElement[i].ntype)
                        if (flowElement[i].$type == 'bpmn:ScriptTask' && flowElement[i].$attrs['qa:ntype'] == 'NodeInstance' && flowElement[i].resultVariable != undefined) {
                          arr.push({ name: flowElement[i].resultVariable, value: flowElement[i].resultVariable });
                        }
                      }
                      return arr;
                    }
                  },
                  set: function (element, values, node) {
                    if (values['qa:TargetURL'] != 'none') {
                      element.businessObject.$attrs['qa:TargetURL'] = values['qa:TargetURL'];
                      element.businessObject.extensionElements.values[0].inputParameters[3].value = values['qa:TargetURL'];
                      return;
                    }
                    element.businessObject.extensionElements.values[0].inputParameters[3].value = '';
                    return;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:TargetURL'
                })
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
                    let opt = [{ name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
                    { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
                    { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
                    if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                    }
                    return opt;

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
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      let arr = [];
                      arr.push({ name: undefined, value: undefined });
                      for (let i = 0; i < length; i++) {
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
              label: this.translate('Set Properties'),
              entries: [
                EntryFactory.selectBox({
                  id: 'State',
                  //description: 'State',
                  label: 'State',
                  selectOptions: function (element, values) {
                    let opt = [{ name: '', value: '' }, { name: 'INITIAL', value: 'INITIAL' }, { name: 'CREATING', value: 'CREATING' }, { name: 'CREATED', value: 'CREATED' }, { name: 'CONFIGURING', value: 'CONFIGURING' },
                    { name: 'STARTING', value: 'STARTING' }, { name: 'STARTED', value: 'STARTED' }, { name: 'STOPPING', value: 'STOPPING' }, { name: 'STOPPED', value: 'STOPPED' }, { name: 'DELETING', value: 'DELETING' },
                    { name: 'DELETED', value: 'DELETED' }, { name: 'ERROR', value: 'ERROR' }, { name: 'MIGRATED', value: 'MIGRATED' }];
                    if (values.selectedOptions.length > 0 && (values.selectedOptions[0] != undefined)) {
                      element.businessObject.extensionElements.values[0].inputParameters[0].value = values.selectedOptions[0].value;
                    }
                    return opt;

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
                      let find = false;
                      // entspricht der Participant Id, indem ich mich gerade befinde.
                      let length = element.businessObject.$parent.flowElements.length;
                      let flowElement = element.businessObject.$parent.flowElements;
                      let arr = [];
                      arr.push({ name: undefined, value: undefined });
                      for (let i = 0; i < length; i++) {
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
                        console.log("INSTANCE ID");
                        console.log(values['qa:instanceID']);
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
                    let arr = [];
                    for (let i = 0; i < CustomPropsProvider.template.length; i++) {
                      let template = CustomPropsProvider.template[i].name;
                      template = template.split('_')[0];
                      arr.push({ name: template, value: template });
                    }
                    return arr;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:NodeTemplate',
                  set: function (element, values, node) {
                    if (values['qa:NodeTemplate'] != 'none') {
                      element.businessObject.$attrs['qa:NodeTemplate'] = values['qa:NodeTemplate'];
                      for (let o = element.businessObject.extensionElements.values[0].inputParameters.length - 1; o >= 0; o--) {
                        if (element.businessObject.extensionElements.values[0].inputParameters[o].name.startsWith('Input_')) {
                          element.businessObject.extensionElements.values[0].inputParameters.pop();
                        }
                      }
                      for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                        let nodetemplate = element.businessObject.$attrs['qa:NodeTemplate']
                        console.log(nodetemplate);
                        let nodeid = CustomPropsProvider.properties[i].id;
                        nodeid = nodeid.split('_')[0];
                        if (nodeid == nodetemplate) {
                          let options = [{ name: 'none', value: 'none' }];
                          let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                          properties = JSON.stringify(properties).split(",");
                          console.log(properties)
                          let propertiesList = 0;
                          for (let j = 0; j < properties.length; j++) {
                            console.log(j)
                            let property = properties[j].split(':')[0].replace("{", "");
                            console.log(property)
                            if (property.startsWith("\"") && property.endsWith("\"")) {
                              property = property.substring(1, property.length - 1);
                              let addinput = true;
                              let propertyValue = properties[j].substr(properties[j].indexOf(':') + 1).replace("}", "");
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
                                  // necessary because we cannot save arrays correct
                                  element.businessObject.$attrs['qa:prop' + j] = property + '#' + propertyValue;
                                  console.log(element.businessObject.$attrs['qa:prop' + i]);

                                  element.businessObject.extensionElements.values[0].inputParameters.push(inputParameter);
                                } else {
                                  addinput = true;
                                }
                              }
                            }

                          } element.businessObject.$attrs['qa:propertiesList'] = properties.length - 1;

                        }
                      }

                      element.businessObject.extensionElements.values[0].inputParameters[2].value = values['qa:NodeTemplate'];
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
                    let options = [{ name: 'none', value: 'none' }];
                    let p = "";
                    for (let i = 0; i < CustomPropsProvider.properties.length; i++) {
                      let nodetemplate = element.businessObject.$attrs['qa:NodeTemplate'];
                      let nodeid = CustomPropsProvider.properties[i].id;
                      nodeid = nodeid.split('_')[0];
                      if (nodeid == nodetemplate) {

                        let properties = CustomPropsProvider.properties[i].properties.kvproperties;
                        properties = JSON.stringify(properties).split(",");
                        console.log("PROPERTIES");
                        console.log()

                        for (let j = 0; j < properties.length; j++) {

                          let property = properties[j].split(':')[0].replace("{", "");
                          if (property.startsWith("\"") && property.endsWith("\"")) {
                            property = property.substring(1, property.length - 1);

                            options.push({ name: property, value: property })
                            p = p + ',' + property;
                          }
                        }
                        //options.push({name: , value: });
                      }
                    }
                    p = p.replace(',', '');
                    element.businessObject.extensionElements.values[0].inputParameters[3].value = p;
                    return options;
                  },
                  setControlValue: true,
                  modelProperty: 'qa:Properties',
                  set: function (element, values, node) {
                    element.businessObject.$attrs['qa:valueProp'] = '';
                    if (values['qa:Properties'] != 'none') {
                      element.businessObject.$attrs['qa:Properties'] = values['qa:Properties'];
                      if (is(element.businessObject, 'bpmn:ScriptTask')) {
                        if (element.businessObject.$attrs['qa:ntype'] === "PropertiesChanger") {
                          element.businessObject.extensionElements.values[0].inputParameters[3].value = values['qa:Properties'];
                        }
                      }

                      for (let o = 0; o < element.businessObject.extensionElements.values[0].inputParameters.length; o++) {
                        console.log(values['qa:Properties'])
                        console.log(element.businessObject.extensionElements.values[0].inputParameters[o].name)
                        let property = 'Input_' + values['qa:Properties'];
                        if (property === element.businessObject.extensionElements.values[0].inputParameters[o].name) {
                          // updates den Wert bei Veränderung, übernimmt aber keine Änderungen aus dem Inputvariabelfeld
                          console.log(element.businessObject.extensionElements.values[0].inputParameters[o].value)
                          element.businessObject.$attrs['qa:valueProp'] = element.businessObject.extensionElements.values[0].inputParameters[o].value;
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
                    let propertyName = element.businessObject.$attrs['qa:Properties'];
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
    else {
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
