import {
  assign
} from 'min-dash';
import _camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";
import BpmnModdle from 'bpmn-moddle';
import Palette from 'diagram-js/lib/features/palette/Palette';

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function CustomPaletteProvider(palette, create, connect, elementFactory, bpmnFactory,spaceTool, lassoTool, handTool) {

  this._create = create;
  this._connect = connect;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._handTool = handTool;
  this._bpmnFactory = bpmnFactory;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
  
}

CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'connect',
  'elementFactory',
  'bpmnFactory',
  'spaceTool',
  'lassoTool',
  'handTool'
];


const moddle = new BpmnModdle({camunda: _camundaModdleDescriptor});


CustomPaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      connect = this._connect,
      elementFactory = this._elementFactory,
      bpmnFactory = this._bpmnFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool;


      function createRect(suitabilityScore) {
        return function(event) {
          const businessObject = bpmnFactory.create('bpmn:ServiceTask');
    
          const shape = elementFactory.createShape({
            type: 'bpmn:ServiceTask',
            businessObject: businessObject
          });
      
          create.start(event, shape); 
  
        
      }}
      
    // danke internet https://forum.bpmn.io/t/proper-way-to-create-and-update-activities-in-bpmn-js-modeler/4696

    function createServiceTemplateInstance() {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:ScriptTask');

        businessObject.resultVariable = "ServiceInstanceURL";
        businessObject.name = "lustige groovy ServiceTemplates";
        businessObject.scriptFormat = "groovy";
        businessObject.resource = "deployment://CreateServiceInstance.groovy";
        businessObject.$attrs.ntype = "ServiceTemplateInstance";
        
        const shape = elementFactory.createShape({
          type: 'bpmn:ScriptTask',
          businessObject: businessObject
        });
        console.log(businessObject);

        create.start(event, shape); 

      
    }}

    function createNodeInstance() {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:ScriptTask', {
          extensionElements: moddle.create('bpmn:ExtensionElements', {
            values: [
              moddle.create('camunda:InputOutput', {
                inputParameters: [
                  moddle.create('camunda:InputParameter', { name: 'NodeTemplate' }),
                ],
              }),
            ],
          })
        });

        businessObject.resultVariable = "NodeInstanceURL (Für jedes Template anders!)";
        businessObject.name = "lustige groovy nodeinstances";
        businessObject.scriptFormat = "groovy";
        businessObject.resource = "deployment://CreateNodeInstance.groovy";
        businessObject.$attrs.ntype = "NodeInstance";
        
        console.log("EXTENSION ELEMENTS");
        console.log(businessObject.extensionElements);
        console.log(businessObject.extensionElements.values);
        console.log(businessObject.extensionElements.values[0].inputParameters);
        console.log("EXTENSION ELEMENTS");
        
        const shape = elementFactory.createShape({
          type: 'bpmn:ScriptTask',
          businessObject: businessObject
        });
        console.log(businessObject);

        create.start(event, shape); 

      
    }}

    function createRelationshipInstance() {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:ScriptTask', {
          extensionElements: moddle.create('bpmn:ExtensionElements', {
            values: [
              moddle.create('camunda:InputOutput', {
                inputParameters: [
                  moddle.create('camunda:InputParameter', { name: 'RelationshipTemplate' }),
                  moddle.create('camunda:InputParameter', { name: 'SourceURL' }),
                  moddle.create('camunda:InputParameter', { name: 'TargetURL' }),
                ],
              }),
            ],
          })
        });

        businessObject.resultVariable = "RealtionshipInstanceURL (Für jedes Template anders!)";
        businessObject.name = "lustige groovy realtionshipinstances";
        businessObject.scriptFormat = "groovy";
        businessObject.resource = "deployment://CreateRelationshipInstance.groovy";
        businessObject.$attrs.ntype = "RelationshipInstance";
        
        const shape = elementFactory.createShape({
          type: 'bpmn:ScriptTask',
          businessObject: businessObject
        });
        console.log(businessObject);

        create.start(event, shape); 

      
    }}

	  function createCallNodeOperation(suitabilityScore) {
        return function(event) {
          const businessObject = bpmnFactory.create('bpmn:ScriptTask', {
            extensionElements: moddle.create('bpmn:ExtensionElements', {
              values: [
                moddle.create('camunda:InputOutput', {
                  inputParameters: [
                    moddle.create('camunda:InputParameter', { name: 'ServiceInstanceID' }),
                    moddle.create('camunda:InputParameter', { name: 'CsarID' }),
                    moddle.create('camunda:InputParameter', { name: 'ServiceTemplateID' }),
                    moddle.create('camunda:InputParameter', { name: 'NodeTemplate' }),
                    moddle.create('camunda:InputParameter', { name: 'Interface' }),
                    moddle.create('camunda:InputParameter', { name: 'Operation' }),
                    moddle.create('camunda:InputParameter', { name: 'InputParamNames' }),
                    moddle.create('camunda:InputParameter', { name: 'InputParamValues' }),
                    moddle.create('camunda:InputParameter', { name: 'OutputParamNames' }),
                  ],
                }),
              ],
            })
          });

          businessObject.name = "lustige groovy node operations";
          businessObject.scriptFormat = "groovy";
          businessObject.resource = "deployment://CallNodeOperation.groovy";
          businessObject.$attrs.ntype = "CallNodeOperation";
          
          const shape = elementFactory.createShape({
            type: 'bpmn:ScriptTask',
            businessObject: businessObject
          });
          console.log(businessObject);

          create.start(event, shape); 
  
        
      }}

      function createStateChanger() {
        return function(event) {
          const businessObject = bpmnFactory.create('bpmn:ScriptTask', {
            extensionElements: moddle.create('bpmn:ExtensionElements', {
              values: [
                moddle.create('camunda:InputOutput', {
                  inputParameters: [
                    moddle.create('camunda:InputParameter', { name: 'Status' }),
                    moddle.create('camunda:InputParameter', { name: 'InstanceURL' }),
                  ],
                }),
              ],
            })
          });

          businessObject.name = "lustige groovy states";
          businessObject.scriptFormat = "groovy";
          businessObject.resource = "deployment://SetState.groovy";
          businessObject.$attrs.ntype = "StateChanger";
          
          const shape = elementFactory.createShape({
            type: 'bpmn:ScriptTask',
            businessObject: businessObject
          });
          console.log(businessObject);

          create.start(event, shape); 
  
        
      }}

      function createPropertiesChanger() {
        return function(event) {
          const businessObject = bpmnFactory.create('bpmn:ScriptTask', {
            extensionElements: moddle.create('bpmn:ExtensionElements', {
              values: [
                moddle.create('camunda:InputOutput', {
                  inputParameters: [
                    moddle.create('camunda:InputParameter', { name: 'InstanceURL' }),
                    moddle.create('camunda:InputParameter', { name: 'Properties' }),
                    moddle.create('camunda:InputParameter', { name: 'Values' }),
                  ],
                }),
              ],
            })
          });

          businessObject.name = "lustige groovy properties";
          businessObject.scriptFormat = "groovy";
          businessObject.resource = "deployment://SetProperties.groovy";
          businessObject.$attrs.ntype = "PropertiesChanger";
          
          const shape = elementFactory.createShape({
            type: 'bpmn:ScriptTask',
            businessObject: businessObject
          });
          console.log(businessObject);

          create.start(event, shape); 
  
        
      }}

    function createNodeInstanceDataObject() {
        return function(event) {
            const businessObject = bpmnFactory.create('bpmn:DataObjectReference', {
                extensionElements: moddle.create('bpmn:ExtensionElements', {
                    values: [
                        moddle.create('camunda:InputOutput', {
                            inputParameters: [
                                moddle.create('camunda:InputParameter', { name: 'ServiceInstanceID' }),
                                moddle.create('camunda:InputParameter', { name: 'CsarID' }),
                                moddle.create('camunda:InputParameter', { name: 'ServiceTemplateID' }),
                                moddle.create('camunda:InputParameter', { name: 'NodeTemplate' }),
                                moddle.create('camunda:InputParameter', { name: 'Interface' }),
                                moddle.create('camunda:InputParameter', { name: 'Operation' }),
                                moddle.create('camunda:InputParameter', { name: 'InputParamNames' }),
                                moddle.create('camunda:InputParameter', { name: 'InputParamValues' }),
                                moddle.create('camunda:InputParameter', { name: 'OutputParamNames' }),
                            ],
                        }),
                    ],
                })
            });

            businessObject.name = "lustiges NodeInstanceDataObject";
            businessObject.$attrs.dtype = "NodeInstanceDataObject";

            const shape = elementFactory.createShape({
                type: 'bpmn:DataObjectReference',
                businessObject: businessObject
            });
            console.log(businessObject);

            create.start(event, shape);
            
        }}

    function createServiceInstanceDataObject() {
        return function(event) {
            const businessObject = bpmnFactory.create('bpmn:DataObjectReference', {
                extensionElements: moddle.create('bpmn:ExtensionElements', {
                    values: [
                        moddle.create('camunda:InputOutput', {
                            inputParameters: [
                                moddle.create('camunda:InputParameter', { name: 'ServiceInstanceID' }),
                                moddle.create('camunda:InputParameter', { name: 'CsarID' }),
                                moddle.create('camunda:InputParameter', { name: 'ServiceTemplateID' }),
                            ],
                        }),
                    ],
                })
            });

            businessObject.name = "lustiges ServiceInstanceDataObject";
            businessObject.$attrs.dtype = "ServiceInstanceDataObject";

            const shape = elementFactory.createShape({
                type: 'bpmn:DataObjectReference',
                businessObject: businessObject
            });
            console.log(businessObject);

            create.start(event, shape);

        }}

    function createRelationshipInstanceDataObject() {
        return function(event) {
            const businessObject = bpmnFactory.create('bpmn:DataObjectReference', {
                extensionElements: moddle.create('bpmn:ExtensionElements', {
                    values: [
                        moddle.create('camunda:InputOutput', {
                            inputParameters: [
                                moddle.create('camunda:InputParameter', { name: 'RelationshipTemplate' }),
                                moddle.create('camunda:InputParameter', { name: 'SourceURL' }),
                                moddle.create('camunda:InputParameter', { name: 'TargetURL' }),
                            ],
                        }),
                    ],
                })
            });

            businessObject.name = "lustiges RelationshipInstanceDataObject";
            businessObject.$attrs.dtype = "RelationshipInstanceDataObject";

            const shape = elementFactory.createShape({
                type: 'bpmn:DataObjectReference',
                businessObject: businessObject
            });
            console.log(businessObject);

            create.start(event, shape);

        }}

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^bpmn:/, '');

    return {
      group: group,
      className: className,
      title: title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createParticipant(event, collapsed) {
    create.start(event, elementFactory.createParticipantShape(collapsed));
  }
  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }

  assign(actions, {
    
    /*
    'custom-triangle': createAction(
      'custom:triangle', 'custom', 'icon-custom-triangle', 'triangle', ''
    ),
    
    'normalertask':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create Task',
      action: {
        dragstart: createRect('60'),
        click: createRect('60')
        
      }
    },
    */
   'hand-tool': {
    group: 'tools',
    className: 'bpmn-icon-hand-tool',
    title: 'Activate the hand tool',
    action: {
      click: function(event) {
        handTool.activateHand(event);
      }
    }
  },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    },
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none', 'StartEvent', ''
    ),
    'create.intermediate-event': createAction(
      'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none', 'IntermediateThrowEvent', ''
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none', 'EndEvent', ''
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor', 'XOR-Gateway', ''
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'bpmn-icon-task', 'Task', ''
    ),
    'create.subprocess-expanded': createAction(
      'bpmn:SubProcess', 'activity', 'bpmn-icon-subprocess-expanded', 'Create expanded SubProcess',
      { isExpanded: true }
    ),
    'create.data-object': createAction(
      'bpmn:DataObjectReference', 'activity', 'bpmn-icon-data-object', 'Create DataObjectReference', ''
   ),
   'create.data-store': createAction(
     'bpmn:DataStoreReference', 'activity', 'bpmn-icon-data-store', 'Create DataStoreReference', ''
  ),
    'create.participant-expanded': {
      group: 'collaboration',
      className: 'bpmn-icon-participant',
      title: 'Create Pool/Participant',
      action: {
        dragstart: createParticipant,
        click: createParticipant
      }
    },
    'create.group': createAction(
      'bpmn:Group', 'activity', 'bpmn-icon-group', ' Create a group', ''
    ),
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.service-instance-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create ServiceInstance',
      action: {
        dragstart: createServiceTemplateInstance(),
        click: createServiceTemplateInstance()
        
      }
    },
    'create.node-instance-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create nodeInstance',
      action: {
        dragstart: createNodeInstance(),
        click: createNodeInstance()
        
      }
    },
    'create.relationship-instance-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create RelationshipInstance',
      action: {
        dragstart: createRelationshipInstance(),
        click: createRelationshipInstance()
        
      }
    },
	  'call-node-operation-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create CallNodeOperation',
      action: {
        dragstart: createCallNodeOperation('60'),
        click: createCallNodeOperation('60')
        
      }
    },
    'set-state-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create SetStateTask',
      action: {
        dragstart: createStateChanger(),
        click: createStateChanger()
        
      }
    },
    'set-properties-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create SetPropertiesTask',
      action: {
        dragstart: createPropertiesChanger(),
        click: createPropertiesChanger()
        
      }
    }, 
      'node-instance-data-object': {
          group: 'activity',
          className: 'bpmn-icon-data-object',
          title: 'Create NodeInstanceDataObject',
          action: {
              dragstart: createNodeInstanceDataObject(),
              click: createNodeInstanceDataObject()
          }
      },
      'service-instance-data-object': {
          group: 'activity',
          className: 'bpmn-icon-data-object',
          title: 'Create ServiceInstanceDataObject',
          action: {
              dragstart: createServiceInstanceDataObject(),
              click: createServiceInstanceDataObject()
          }
      },
      'relationship-instance-data-object': {
          group: 'activity',
          className: 'bpmn-icon-data-object',
          title: 'Create RelationshipInstanceDataObject',
          action: {
              dragstart: createRelationshipInstanceDataObject(),
              click: createRelationshipInstanceDataObject()
          }
      },
  });

  return actions;
};
