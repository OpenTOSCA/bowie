import { Injectable } from '@angular/core';
import {is} from 'bpmn-js/lib/util/ModelUtil.js'; //modelUtil

@Injectable()
export class BpmnCreator {

  constructor() {  
  }

   /**
    * Create a bpmn diagram with given data
    * @param modeler bpmn-js modeler
    * @param dataArray Array with neccessary  data from bpelservice
    */
   createBpmn(modeler: any, dataArray: any) {
    // Anmerkung: Positionen sind IMMER absolut auf dem canvas

    const elementFactory = modeler.get('elementFactory');
    const bpmnFactory = modeler.get('bpmnFactory');
    const canvas = modeler.get('canvas');
    const modeling = modeler.get('modeling');
    const elementRegistry = modeler.get('elementRegistry');
    const moddle = modeler.get('moddle');

    //remove startevent which gets placed initially to prevent unneccessary elements and connections
    let firststartevent = elementRegistry.filter(function(element) {
      return is(element, 'bpmn:StartEvent');
    });
    if(firststartevent.length > 0){
      modeling.removeElements(firststartevent);
    }
    
    let dummyEvent = elementFactory.createShape({
      type: 'bpmn:StartEvent'
    });
    let lastGenerated = dummyEvent;
    let newGenerated = dummyEvent;

    //let outerX = 0;
    let outerY = 0;
    let innerbusinessObject;
    let innershape;
    let innerposition;
    
    dataArray.forEach(scope => {
      let businessObject = bpmnFactory.create('bpmn:SubProcess');
      businessObject.name = scope.scope;

      let shape = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        businessObject: businessObject,
        isExpanded: true,
      });

      let position = {
        x: 0,
        y: outerY 
      }

      let mainscope = modeling.createShape(shape, position, canvas.getRootElement());
      newGenerated = mainscope;

      //dummy shapes
      let dummyEvent2 = elementFactory.createShape({
        type: 'bpmn:StartEvent'
      });

      let innerLastGenerated = dummyEvent2;
      let innerNewGenerated;
      let innerX = 0;
      //let innerY = 0;
      let extraWaypoints = false;   // flag for creating a sequenceflow which connects to the next row
      let compensation = false;     // compensation scope flag
      let fault = false;            // fault scope flag

      scope.data.forEach(innerscope => {        
           //fault handler
           if((fault && (innerscope.scope === scope.scope)) || (fault && innerscope.scope.includes('compensation_'))){
             if(extraWaypoints){
               extraWaypoints = false;
               innerLastGenerated = dummyEvent2;
               fault = false;
             }else{
              innerX = 0;
              outerY += 400;
              innerLastGenerated = dummyEvent2;
              fault = false;
             }

           //compensation handler (rechter fall sollte eigentlich nie auftreten)
           }else if((compensation && (innerscope.scope === scope.scope)) || (compensation && innerscope.scope.includes('fault_'))){
            if(extraWaypoints){
              extraWaypoints = false;
              innerLastGenerated = dummyEvent2;
              compensation = false;
            }else{
             innerX = 0;
             outerY += 400;
             innerLastGenerated = dummyEvent2;
             compensation = false;
            }
           }

           //create fault scope
           if(!fault && innerscope.scope.includes('fault_')){
             //---------------------------------------------------------------------------------
            let errorBoundaryEvent = elementFactory.createShape({
              type: 'bpmn:StartEvent',
              eventDefinitionType: 'bpmn:ErrorEventDefinition'
            });
            modeling.createShape(errorBoundaryEvent, {x: innerX, y: outerY}, mainscope);
            innerX += 150;
            //----------------------------------------------------------------------------------

            let bof = bpmnFactory.create('bpmn:SubProcess');
            bof.name = 'fault_' + scope.scope;
      
            let fshape = elementFactory.createShape({
              type: 'bpmn:SubProcess',
              businessObject: bof,
              isExpanded: true
            });
            innerX += 150;
            let fposition = {
              x: innerX,
              y: outerY
            }
            newGenerated = fshape;
            modeling.createShape(fshape, fposition, mainscope);
            //--------------------------------------------------------------------------------------
            modeling.connect(errorBoundaryEvent, fshape);
            //--------------------------------------------------------------------------------------

            //create compensation scope
           }else if(!compensation && innerscope.scope.includes('compensation_')){

            let compensationBoundaryEvent = elementFactory.createShape({
              type: 'bpmn:StartEvent',
              eventDefinitionType: 'bpmn:CompensateEventDefinition'
            });

            modeling.createShape(compensationBoundaryEvent, {x: innerX, y: outerY}, mainscope);
            innerX += 150;

            let bof = bpmnFactory.create('bpmn:SubProcess');
            bof.name = 'compensation_' + scope.scope;
      
            let cshape = elementFactory.createShape({
              type: 'bpmn:SubProcess',
              businessObject: bof,
              isExpanded: true
            });
            innerX += 150;
            let cposition = {
              x: innerX,
              y: outerY
            }
            newGenerated = cshape;
            modeling.createShape(cshape, cposition, mainscope);

            modeling.connect(compensationBoundaryEvent, cshape);

            //set the right parent
          }else if((innerscope.scope === scope.scope)){
            newGenerated = mainscope;
          }         
           //--------------------------------------------------------------------------------------------------------------------test

            // bpel4RestLight:PUT representation
           if(innerscope.type === 'bpel4RestLight:PUT'){        
            innerbusinessObject = bpmnFactory.create('bpmn:SendTask', {
              documentation: [
                moddle.create('bpmn:Documentation', {text: 'data'})
              ]
            });
              innerbusinessObject.name = "bpel4RestLight:PUT";
              innerbusinessObject.documentation[0].text = this.setDocumentationText(innerscope);

              innershape = elementFactory.createShape({
              type: 'bpmn:SendTask',
              businessObject: innerbusinessObject
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            innerNewGenerated = innershape;
            modeling.createShape(innershape, innerposition, newGenerated);

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){
              if(extraWaypoints){
                let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi
                  });
                let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape2 = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi2
                  });
                let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
                let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
                modeling.connect(innerLastGenerated,m2);
                modeling.connect(m2,m1);
                modeling.connect(m1, innerNewGenerated);
                extraWaypoints = false;
                  
                }else{
                  let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                  if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                    modeling.updateProperties(innerLastGenerated, {default: flow});
                  }
                }
            }
            innerX += 150
            innerLastGenerated = innerNewGenerated;
            

          // bpel4RestLight:POST representation
          }else if(innerscope.type === 'bpel4RestLight:POST'){
            innerbusinessObject = bpmnFactory.create('bpmn:SendTask', {
              documentation: [
                moddle.create('bpmn:Documentation', {text: 'data'})
              ]
            });
            innerbusinessObject.name = "bpel4RestLight:POST";
            innerbusinessObject.documentation[0].text = this.setDocumentationText(innerscope);

            innershape = elementFactory.createShape({
            type: 'bpmn:SendTask',
            businessObject: innerbusinessObject
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            innerNewGenerated = innershape;
            modeling.createShape(innershape, innerposition, newGenerated);

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){
              if(extraWaypoints){
                let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi
                  });
                let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape2 = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi2
                  });
                let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
                let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
                modeling.connect(innerLastGenerated,m2);
                modeling.connect(m2,m1);
                modeling.connect(m1, innerNewGenerated);
                extraWaypoints = false;
                  
                }else{
                  let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                  if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                    modeling.updateProperties(innerLastGenerated, {default: flow});
                  }
                }
            }
            innerX += 150
            innerLastGenerated = innerNewGenerated;


            // bpel4RestLight:GET representation
          }else if(innerscope.type === 'bpel4RestLight:GET'){
            innerbusinessObject = bpmnFactory.create('bpmn:SendTask', {
              documentation: [
                moddle.create('bpmn:Documentation', {text: 'data'})
              ]
            });
            innerbusinessObject.name = "bpel4RestLight:GET";
            innerbusinessObject.documentation[0].text = this.setDocumentationText(innerscope);

            innershape = elementFactory.createShape({
            type: 'bpmn:SendTask',
            businessObject: innerbusinessObject
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            innerNewGenerated = innershape;
            modeling.createShape(innershape, innerposition, newGenerated);

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){
              if(extraWaypoints){
                let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi
                  });
                let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape2 = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi2
                  });
                let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
                let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
                modeling.connect(innerLastGenerated,m2);
                modeling.connect(m2,m1);
                modeling.connect(m1, innerNewGenerated);
                extraWaypoints = false;
                  
                }else{
                  let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                  if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                    modeling.updateProperties(innerLastGenerated, {default: flow});
                  }
                }
            }
            innerX += 150
            innerLastGenerated = innerNewGenerated;


            // bpel:invoke representation
          }else if(innerscope.type === 'bpel:invoke'){
            innerbusinessObject = bpmnFactory.create('bpmn:SendTask', {
              documentation: [
                moddle.create('bpmn:Documentation', {text: 'data'})
              ]
            });
            innerbusinessObject.name = "bpel:invoke";
            innerbusinessObject.documentation[0].text = this.setDocumentationText(innerscope);

            innershape = elementFactory.createShape({
            type: 'bpmn:SendTask',
            businessObject: innerbusinessObject
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            innerNewGenerated = innershape;
            modeling.createShape(innershape, innerposition, newGenerated);

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){
              if(extraWaypoints){
                let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi
                  });
                let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape2 = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi2
                  });
                let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
                let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
                modeling.connect(innerLastGenerated,m2);
                modeling.connect(m2,m1);
                modeling.connect(m1, innerNewGenerated);
                extraWaypoints = false;
                  
                }else{
                  let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                  if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                    modeling.updateProperties(innerLastGenerated, {default: flow});
                  }
                }
            }
            innerX += 150
            innerLastGenerated = innerNewGenerated;


            // bpel:throw (bpel:if) representation
          }else if(innerscope.type === 'bpel:throw'){
            innerbusinessObject = bpmnFactory.create('bpmn:Task', {
              documentation: [
                moddle.create('bpmn:Documentation', {text: 'data'})
              ]
            });
            innerbusinessObject.name = "bpel:throw";
            innerbusinessObject.documentation[0].text = this.setDocumentationText(innerscope);

            innershape = elementFactory.createShape({
            type: 'bpmn:Task',
            businessObject: innerbusinessObject
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            //create exclusiveGateway
            let gatewayBusinessObject = bpmnFactory.create('bpmn:ExclusiveGateway');
            gatewayBusinessObject.name = 'bpel:if';

            let gateway = elementFactory.createShape({
            type: 'bpmn:ExclusiveGateway',
            businessObject: gatewayBusinessObject
            });

            modeling.createShape(gateway, innerposition, newGenerated);
            innerNewGenerated = gateway;

            //innerNewGenerated = innershape;
            modeling.createShape(innershape, {x:innerX, y: outerY + 100}, newGenerated);
            modeling.connect(gateway, innershape);

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){
              if(extraWaypoints){
                let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi
                  });
                let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape2 = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi2
                  });
                let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
                let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
                modeling.connect(innerLastGenerated,m2);
                modeling.connect(m2,m1);
                modeling.connect(m1, innerNewGenerated);
                extraWaypoints = false;
                  
                }else{
                  let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                  if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                    modeling.updateProperties(innerLastGenerated, {default: flow});
                  }
                }
            }
            innerX += 150
            innerLastGenerated = innerNewGenerated;
            

            // bpel:receive representation
          }else if(innerscope.type === 'bpel:receive'){
            innerbusinessObject = bpmnFactory.create('bpmn:ReceiveTask', {
              documentation: [
                moddle.create('bpmn:Documentation', {text: 'data'})
              ]
            });
            innerbusinessObject.name = "bpel:receive";
            innerbusinessObject.documentation[0].text = this.setDocumentationText(innerscope);

            innershape = elementFactory.createShape({
            type: 'bpmn:ReceiveTask',
            businessObject: innerbusinessObject
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            innerNewGenerated = innershape;
            modeling.createShape(innershape, innerposition, newGenerated);

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){
              if(extraWaypoints){
                let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi
                  });
                let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
                let tmpshape2 = elementFactory.createShape({
                  type: 'bpmn:IntermediateThrowEvent',
                  businessObject: boi2
                  });
                let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
                let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
                modeling.connect(innerLastGenerated,m2);
                modeling.connect(m2,m1);
                modeling.connect(m1, innerNewGenerated);
                extraWaypoints = false;
                  
                }else{
                  let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                  if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                    modeling.updateProperties(innerLastGenerated, {default: flow});
                  }
                }
            }
            innerX += 150
            innerLastGenerated = innerNewGenerated;


            //bpel: assign representation
          }else if(innerscope.type === 'bpel:assign'){
            innerX += 150;
            innerbusinessObject = bpmnFactory.create('bpmn:SubProcess');

            //name assignblock
            innerbusinessObject.name = "bpel:assign \n" + innerscope.data[0].assignblock;
            
            innershape = elementFactory.createShape({
            type: 'bpmn:SubProcess',
            businessObject: innerbusinessObject,
            isExpanded: true
            });

            innerposition = {
              x: innerX,
              y: outerY
            }

            innerNewGenerated = innershape;
            modeling.createShape(innershape, innerposition, newGenerated);


            //assignblöcke
            innerscope.data.forEach(assignblockelement => {
              let bo1 = bpmnFactory.create('bpmn:ScriptTask', {
                documentation: [
                  moddle.create('bpmn:Documentation', {text: 'data'})
                ]
              });
              let bo2 = bpmnFactory.create('bpmn:ScriptTask', {
                documentation: [
                  moddle.create('bpmn:Documentation', {text: 'data'})
                ]
              });
       
              bo1.name = "bpel:from";
              bo2.name = "bpel:to";

              bo1.documentation[0].text = this.setDocumentationText(assignblockelement, 0, innerscope);
              bo2.documentation[0].text = this.setDocumentationText(assignblockelement, 1, innerscope);

              let sh1 = elementFactory.createShape({
                type: 'bpmn:ScriptTask',
                businessObject: bo1
              });

              let sh2 = elementFactory.createShape({
                type: 'bpmn:ScriptTask',
                businessObject: bo2
              });

              let po1 = {
                x: innerX,
                y: outerY
              }

              modeling.createShape(sh1, po1, innerNewGenerated);
              innerX += 150;

              let po2 = {
                x: innerX,
                y: outerY
              }
              modeling.createShape(sh2, po2, innerNewGenerated);
              modeling.connect(sh1, sh2);
              innerX += 150;
            
            });

            // Ignore first element inside subtask
            if(innerLastGenerated.type != 'bpmnStartEvent'){            
             if(extraWaypoints){
              let boi = bpmnFactory.create('bpmn:IntermediateThrowEvent');
              let tmpshape = elementFactory.createShape({
                type: 'bpmn:IntermediateThrowEvent',
                businessObject: boi
                });
              let boi2 = bpmnFactory.create('bpmn:IntermediateThrowEvent');
              let tmpshape2 = elementFactory.createShape({
                type: 'bpmn:IntermediateThrowEvent',
                businessObject: boi2
                });
              let m1 = modeling.createShape(tmpshape, {x:innerNewGenerated.x + (innerNewGenerated.width/2), y:outerY-200}, newGenerated);
              let m2 = modeling.createShape(tmpshape2, {x:innerLastGenerated.x + (innerLastGenerated.width/2), y:outerY-200}, newGenerated);
              modeling.connect(innerLastGenerated,m2);
              modeling.connect(m2,m1);
              modeling.connect(m1, innerNewGenerated);
              extraWaypoints = false;
                
              }else{
                let flow = modeling.connect(innerLastGenerated, innerNewGenerated);
                if(innerLastGenerated.type === 'bpmn:ExclusiveGateway'){
                  modeling.updateProperties(innerLastGenerated, {default: flow});
                }
              }          
            }

            innerX += 150;
            innerLastGenerated = innerNewGenerated;
          }

          //compensation + fault flags
          if(innerscope.scope.includes('fault_')){
            fault = true;
          }else if(innerscope.scope.includes('compensation_')){
            compensation = true;
          }

          //dammit es schöner aussieht :D     
          if(innerX >= 7500){
            innerX = 0;
            outerY += 400;
            extraWaypoints = true;
          }
      });

      outerY += 500;
      if(lastGenerated.type != 'bpmnStartEvent'){
        modeling.connect(lastGenerated, newGenerated);
      }
      lastGenerated = newGenerated;
    
    });
    
    //add boundary events for fault and compensation scopes
    /*
    const subprocesses = elementRegistry.filter(function(element) {
      return is(element, 'bpmn:SubProcess');
    });

    for (let j = 0; j < subprocesses.length; j++) {
      if(subprocesses[j].businessObject.name.includes("fault_")){
        let errorBoundaryEvent = elementFactory.createShape({
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:ErrorEventDefinition'
        });
        let a = modeling.createShape(errorBoundaryEvent, { x: subprocesses[j].parent.x, y: subprocesses[j].y + (subprocesses[j].height/2) }, subprocesses[j].parent, { attach: true });
        //modeling.connect(a, subprocesses[j]); geht nicht wegen rules...

      }else if(subprocesses[j].businessObject.name.includes("compensation_")){
        let compensationBoundaryEvent = elementFactory.createShape({
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:CompensateEventDefinition'
        });
        modeling.createShape(compensationBoundaryEvent, { x: subprocesses[j].parent.x, y: subprocesses[j].y + (subprocesses[j].height/2) }, subprocesses[j].parent, { attach: true });
      }            
    }
    */
    canvas.zoom('fit-viewport');
       
  }

  /**
   * sets the correct input for the element documentation field
   * @param innerscope scope with correspondant data
   * @param assigninfo optinal information for assignblocks: 0: from, 1: to 
   * @param parent optional information for assignblocks: parent of the assignblock
   */
  setDocumentationText(innerscope:any, assigninfo?:number, parent?:any){
    let returnstring = "";
    if((innerscope.type === 'bpel:invoke') || (innerscope.type === 'bpel:receive') || (innerscope.type === 'bpel4RestLight:GET') || (innerscope.type === 'bpel4RestLight:POST') 
        || (innerscope.type === 'bpel4RestLight:PUT') || (innerscope.type === 'bpel:throw')){

      for(const [key, value] of Object.entries(innerscope.data)){
        if(value != ""){
          returnstring += key +": "+ value + "\n\n";
        }
      }

    }else if((parent.type === 'bpel:assign') && (assigninfo == 0)){
      //invokeOperationAsynch information
      if(innerscope.hasOwnProperty("impl:invokeOperationAsynch information")){
        let inf = innerscope["impl:invokeOperationAsynch information"];
        let params = inf[0].Params;
        returnstring = "from: " + innerscope.from + "\n\n";
        for(const [key, value] of Object.entries(inf[0])){
          if((value != "")){
            //Params handler
            if(key === "Params"){
              returnstring += key +": "+ "\n";
              for (let i = 0; i < params.length; i++) {
                returnstring += "    key: " + params[i].key + "\n" + "    value: " + params[i].value + "\n\n";              
              }
            }else{
            returnstring += key +": "+ value + "\n\n";
            }
          }
         }

      }else{
        for(const [key, value] of Object.entries(innerscope)){
          if((value != "") && key.includes("from")){
            returnstring += key +": "+ value + "\n\n";
          }
         }
      }
    }else if((parent.type === 'bpel:assign') && (assigninfo == 1)){
      for(const [key, value] of Object.entries(innerscope)){
        if((value != "") && key.includes("to")){
          returnstring += key +": "+ value + "\n\n";
        }
       }
    }
    return returnstring;
  }
 
}