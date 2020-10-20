import {
  assign
} from 'min-dash';
import _camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";
import BpmnModdle from 'bpmn-moddle';

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function CustomPaletteProvider(palette, create, elementFactory, bpmnFactory,spaceTool, lassoTool) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._bpmnFactory = bpmnFactory;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
}

CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'bpmnFactory',
  'spaceTool',
  'lassoTool'
];


const moddle = new BpmnModdle({camunda: _camundaModdleDescriptor});


CustomPaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      bpmnFactory = this._bpmnFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool;


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
          
          const shape = elementFactory.createShape({
            type: 'bpmn:ScriptTask',
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
    'create-service-instance-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create ServiceInstance',
      action: {
        dragstart: createServiceTemplateInstance(),
        click: createServiceTemplateInstance()
        
      }
    },
    'create-node-instance-task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Create nodeInstance',
      action: {
        dragstart: createNodeInstance(),
        click: createNodeInstance()
        
      }
    },
    'create-relationship-instance-task':{
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
    'tool-separator': {
      group: 'tools',
      separator: true
    }
  });

  return actions;
};