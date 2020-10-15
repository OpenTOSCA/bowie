import {
  assign
} from 'min-dash';


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


CustomPaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      bpmnFactory = this._bpmnFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool;


      function createRect(suitabilityScore) {
        return function(event) {
          const businessObject = bpmnFactory.create('bpmn:Task');
    
          const shape = elementFactory.createShape({
            type: 'bpmn:Task',
            businessObject: businessObject
          });
      
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
    'custom-triangle': createAction(
      'custom:triangle', 'custom', 'icon-custom-triangle', 'triangle', ''
    ),
    'task':{
      group: 'activity',
      className: 'bpmn-icon-task',
      title: 'Activate the lasso tool',
      action: {
        dragstart: createRect('60'),
        click: createRect('60')
        
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