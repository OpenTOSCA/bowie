import { Injectable } from '@angular/core';

import {HttpClient} from '@angular/common/http';
import * as sax from 'sax-ts';
import { Stack } from 'stack-typescript';
import {BpmnCreator} from './bpmncreator.service';


@Injectable()
export class BpelService {

    private modeler: any;
    private url: any;
    

    constructor(private http: HttpClient,
                private bpmncreator: BpmnCreator){ 
    }

    /**
     * Passes the plan to the parser 
     * @param modeler BPMN modeler for visualisation
     * @param url plan to be parsed
     */
    parseBpel(modeler: any, url: any) {
      this.modeler = modeler;
      this.url = url;
      this.fetchBpel();
    }

    /**
     * fetch the plan
     */
    fetchBpel(){      
        this.http.get(this.url, {
            headers: {observe: 'response'}, responseType: 'text' 
          }).subscribe(
            (y: any) => {
              next: this.bpelspass(y, this.modeler);
              error: this.handleError2;
            });        
    }

    /**
     * Handles errors
     * @param err error to be handled
     */
    handleError2(err: any) {
        if (err) {
          console.warn('Ups, error: ', err);
        }
      }

    /**
    * Parse the bpel file and send the parsed information to BpmnCreator
    * @param x bpel to be parsed
    */
    bpelspass(x, modeler: any){
        this.modeler = modeler;
        console.log('Fetched bpel, now parsing: ', x);
        let xml = x;

        const strict: boolean = true; // change to false for HTML parsing
        const options: {} = {normalize: true}; // refer to "Arguments" section
        const parser = new sax.SAXParser(strict, options);
        
        let linkcounter = 0;
        let seqEdges = [];
        let stack = new Stack<any>(); // Stack is used to get information of specific parent/child nodes if needed
        let currentScope = "";
        let scopes = []; // scopes mit den target/sources (targets -> eingehende kanten, sources -> ausgehende kanten):  [name, [targets], [sources]] bisl weiter unten geändert, sollte aber gleich funktionieren
        let inedges = []; // all incoming edges
        let outedges = [];  // all outgoing edges
        let mainsequenceactive: boolean = false; // true if parser is inside of a mainsequence (mainly for testing)
        let faulthandler: boolean = false; // true if parser is insiede of a fault scope
        let compensationhandler: boolean = false; // true if parser is inside of a compensation scope
        let flowactive: boolean = false; // true if parser is inside of the flow
        let scopedataArr = []; // contains all the data of a scope in order
        let dataArr = []; // contains all data (but not in order!)

        //assignhandler variables
        let assignblock: boolean = false; // true if parser is inside of an assignblock
        let assignblockname = "";
        let assignarr = []; // contains assignblock information
        let hascdataf: boolean = false; //cdata im assignblock from
        let hascdatat: boolean = false; //cdata im assignblock to
        let hascdatafv: boolean = false; //query cdata
        let hascdatatv: boolean = false; //query cdata
        let from = ""; //bpel:from 
        let fromquery = "";
        let to = ""; //bpel:to
        let toquery = ";"
        let partf = "";              // used if bpel:from contains   "part="   
        let partt = "";              // used if bpel:to contains   "part=" 
        let headerf = "";            // used if bpel:from contains   "header=" 
        let headert = "";            // used if bpel:to contains   "header="
        let endpointReferencef = ""; // used if bpel:from contains   "endpointReference="
        let endpointReferencet = ""; // used if bpel:to contains   "endpointReference=" 
        let partnerlinkf = "";       // used if bpel:from contains   "partnerlink="
        let partnerlinkt = "";       // used if bpel:to contains   "partnerlink="

        // invoke/receive handler variables
        let invokereceiveblock: boolean = false; // true if parser is inside of a bpel:invoke or bpel:receive block
        let invokereceiveblockname = ""; // invoke/receive information
        let invokereceivevariable = "";
        let invokereceiveporttype = "";
        let invokereceiveoperation = "";        
        let invokereceivepartnerlink = "";
        let correlationinitiate = "";
        let correlationset = "";

        let bpelif: boolean = false; // true if the parser is inside of a bpel:if block
        let conditiondata = "";

        let literalflag: boolean = false; // true if the text is a part of api:log
        let wliteralflag: boolean = false; // true if the text is part of wsa:replyTo 
        let serviceinstanceid = ""; // contains api:CreateRelationshipTemplateInstanceRequest information
        let sourceinstanceid = "";  
        let targetinstanceid = "";  
        let invokeoperationasynchflag: boolean = false;
        let ioastring: boolean = false; // invokeoperationsasynch string input flag
        let ioacounter = -1;
        let invokeoperationasynchvars = []; // invokeoperationasynch all inputs
        let paramflag: boolean = false; // flag for reading the data of invokeoperationsasynch
        let invokeoperationasynchparams = []; // is used to save key/value Param pairs


        // an error happened.
        parser.onerror = function (e) {
          console.error(e);
          parser.close();
        };

        //stack.top -> parent node!
        parser.onopentag = function (node) {

          if(node.name == 'process'){
          //console.log('onOpenTag: ', node);
          
          }else if(node.name == 'flow'){
            flowactive = true;

          }else if(node.name == 'scope' && !(node.attributes.name.includes('fault_') || node.attributes.name.includes('compensation_'))){
            currentScope = node.attributes.name;
            
          // links  
          }else if(node.name == 'link'){
            seqEdges.push(node.attributes.name);
            linkcounter++;

          // incoming edges  
          }else if(node.name == 'target'){
            inedges.push(node.attributes.linkName);

          // outgoing edges  
          }else if(node.name == 'source'){
            outedges.push(node.attributes.linkName);

          }else if(node.name == 'faultHandlers'){
            faulthandler = true;

          }else if(node.name == 'compensationHandler'){
            compensationhandler = true;

          // sequences  
          }else if(node.name == 'sequence' && node.attributes.hasOwnProperty('name')){         
            if((node.attributes.name.includes('_mainSequence')) && !(node.attributes.name.includes('fault_') || node.attributes.name.includes('compensation_'))){
              mainsequenceactive = true;
/*
            }else if(!(node.attributes.name.includes('_mainSequence')) && !(node.attributes.name.includes('fault_') || node.attributes.name.includes('compensation_'))){
              //console.log('<' + node.name + '>');*/
            }

          // assign
          }else if(node.name == 'bpel:assign' && flowactive){
            assignblock = true;
            if(node.attributes.hasOwnProperty('name')){
              assignblockname = node.attributes.name;
            }else{
              assignblockname = "unnamed";
            }
            
            /* //for testing
            if(mainsequenceactive){
            console.log("assignblock: " + assignblockname);
            console.log(node)
            }*/

          // bpel:from im assignblock  
          }else if((node.name == 'bpel:from') && flowactive && assignblock){
            if(node.attributes.hasOwnProperty('variable')){
              from = node.attributes.variable;
              if(node.attributes.hasOwnProperty('part')){
                partf = node.attributes.part;
              }
              if(node.attributes.hasOwnProperty('header')){
                headerf = node.attributes.header;
              }

            }else if(node.attributes.hasOwnProperty('expressionLanguage')){
              hascdataf = true;

            }else if(node.attributes.hasOwnProperty('endpointReference') && node.attributes.hasOwnProperty('partnerLink')){
              endpointReferencef = node.attributes.endpointReference;
              partnerlinkf = node.attributes.partnerLink;
            }

          // bpel:to im assignblock  
          }else if((node.name == 'bpel:to') && flowactive && assignblock){
            if(node.attributes.hasOwnProperty('variable')){
              to = node.attributes.variable;
              if(node.attributes.hasOwnProperty('part')){
                partt = node.attributes.part;
              }
              if(node.attributes.hasOwnProperty('header')){
                headert = node.attributes.header;
              }

            }else if(node.attributes.hasOwnProperty('expressionLanguage')){
              hascdatat = true;

            }else if(node.attributes.hasOwnProperty('endpointReference') && node.attributes.hasOwnProperty('partnerLink')){
              endpointReferencet = node.attributes.endpointReference;
              partnerlinkt = node.attributes.partnerLink;
            }

          //bpel:query if variables need a query
          }else if((node.name == 'bpel:query') && flowactive){
            if(stack.top.attributes.hasOwnProperty('variable')){
              if(stack.top.attributes.variable == from){
                hascdatafv = true;

              }else if(stack.top.attributes.variable == to){
                hascdatatv = true;
              }
            }

          // bpel:invoke
          }else if((node.name == 'bpel:invoke') && flowactive){
            invokereceiveblock = true;
            if(node.attributes.hasOwnProperty('inputVariable') && node.attributes.hasOwnProperty('partnerLink') && node.attributes.hasOwnProperty('portType') 
               && node.attributes.hasOwnProperty('name') && node.attributes.hasOwnProperty('operation')){
                // set invokeattributes
                invokereceiveblockname = node.attributes.name;
                invokereceiveoperation = node.attributes.operation;
                invokereceivepartnerlink = node.attributes.partnerLink;
                invokereceivevariable = node.attributes.inputVariable;
                invokereceiveporttype = node.attributes.portType;
            }

          // bpel:receive
          }else if((node.name == 'bpel:receive') && flowactive){
            invokereceiveblock = true;
            if(node.attributes.hasOwnProperty('variable') && node.attributes.hasOwnProperty('partnerLink') && node.attributes.hasOwnProperty('portType') 
               && node.attributes.hasOwnProperty('name') && node.attributes.hasOwnProperty('operation')){
                // set receiveattributes
                invokereceiveblockname = node.attributes.name;
                invokereceiveoperation = node.attributes.operation;
                invokereceivepartnerlink = node.attributes.partnerLink;
                invokereceivevariable = node.attributes.variable;
                invokereceiveporttype = node.attributes.portType;
            }

          // bpel:correlation (always with invoke/receive)
          }else if((node.name == 'bpel:correlation') && invokereceiveblock){
            if(node.attributes.hasOwnProperty('set') && node.attributes.hasOwnProperty('initiate')){
              correlationinitiate = node.attributes.initiate;
              correlationset = node.attributes.set;
            }

          // GET handler
          }else if((node.name == 'bpel4RestLight:GET') && flowactive){
            if(node.attributes.hasOwnProperty('accept') && node.attributes.hasOwnProperty('response') && node.attributes.hasOwnProperty('uri')){
              let httpobj = {
                accept: node.attributes.accept,
                response: node.attributes.response,
                uri: node.attributes.uri
              };
              // add fault + compensationscope tags
              let tmpscope = currentScope;
              if(faulthandler){
                tmpscope = "fault_" + tmpscope;
              }else if(compensationhandler){
                tmpscope = "compensation_" + tmpscope;
              }
              scopedataArr.push({type: node.name, scope: tmpscope, data: httpobj })
            }

          // POST handler
          }else if((node.name == 'bpel4RestLight:POST') && flowactive){
            if(node.attributes.hasOwnProperty('request') && node.attributes.hasOwnProperty('uri')){
              let httpobj = {
                accept: "",
                contentType: "",
                request: node.attributes.request,
                response: "",
                uri: node.attributes.uri
              };
              if(node.attributes.hasOwnProperty('accept') && node.attributes.hasOwnProperty('response') && node.attributes.hasOwnProperty('contenttype')){
                httpobj.accept = node.attributes.accept;
                httpobj.response = node.attributes.response;
                httpobj.contentType = node.attributes.contenttype;
              }
              // add fault + compensationscope tags
              let tmpscope = currentScope;
              if(faulthandler){
                tmpscope = "fault_" + tmpscope;
              }else if(compensationhandler){
                tmpscope = "compensation_" + tmpscope;
              }
              scopedataArr.push({type: node.name, scope: tmpscope, data: httpobj })
            }

          // PUT handler
          }else if((node.name == 'bpel4RestLight:PUT') && flowactive){
            if(node.attributes.hasOwnProperty('request') && node.attributes.hasOwnProperty('uri') && node.attributes.hasOwnProperty('accept')){
              let httpobj = {
                accept: node.attributes.accept,
                contentType: "",
                request: node.attributes.request,
                uri: node.attributes.uri
              };
              if(node.attributes.hasOwnProperty('contenttype')){
                httpobj.contentType = node.attributes.contenttype;
              }
              // add fault + compensationscope tags
              let tmpscope = currentScope;
              if(faulthandler){
                tmpscope = "fault_" + tmpscope;
              }else if(compensationhandler){
                tmpscope = "compensation_" + tmpscope;
              }
              scopedataArr.push({type: node.name, scope: tmpscope, data: httpobj })
            }

            //open cdata input for bpel:condition
          }else if((node.name == 'bpel:condition') && flowactive){
            if(stack.top.name == 'bpel:if'){
              bpelif = true;
            }

            //bpel:throw
          }else if((node.name == 'bpel:throw') && flowactive && (stack.top.name == 'bpel:if')){
            if(node.attributes.hasOwnProperty('faulVariable') && node.attributes.hasOwnProperty('faultName')){
              // add fault + compensationscope tags
              let tmpscope = currentScope;
              if(faulthandler){
                tmpscope = "fault_" + tmpscope;
              }else if(compensationhandler){
                tmpscope = "compensation_" + tmpscope;
              }
              scopedataArr.push({type: node.name, scope: tmpscope, data: {
                faulVariable: node.attributes.faulVariable, 
                faultName: node.attributes.faultName, 
                ifConditiondata: conditiondata}});
              //reset cdatainput  
              conditiondata = "";

            }

          // bpel:literal
          }else if((stack.top.name == 'bpel:literal') && flowactive && assignblock){
            if(node.name == 'api:log'){
              literalflag = true;

            }else if(node.name == 'api:CreateRelationshipTemplateInstanceRequest'){
              if(node.hasOwnProperty('service-instance-id') && node.hasOwnProperty('source-instance-id') && node.hasOwnProperty('target-instance-id')){
                serviceinstanceid = node.attributes["service-instance-id"]; // need to do it this way because of "-" inside of the string
                sourceinstanceid = node.attributes["source-instance-id"];
                targetinstanceid = node.attributes["target-instance-id"];
              }

            //implement correlationID handler here if needed
            }else if(node.name == 'correlationID'){
              //outise of the flow!!!
              //literalflag needs to be true

            }else if(node.name == 'wsa:ReplyTo'){
              wliteralflag = true;

            }else if(node.name == 'impl:invokeOperationAsync'){
              invokeoperationasynchflag = true;   
              invokeoperationasynchvars.push({
                PlanCorrelationID: "",
                CsarID: "",
                ServiceInstanceID: "",
                ServiceTemplateIDNamespaceURI: "",
                ServiceTemplateIDLocalPart: "",
                InterfaceName: "",
                NodeTemplateID: "",
                OperationName: "",
                ReplyTo: "",
                MessageID: "",
                Params: []
              });      
            }
            
          }else if(invokeoperationasynchflag && flowactive && assignblock && (node.name != 'impl:Param')){
            ioastring = true;
            ioacounter++;

          // invokeoperationsasynch Params handler 
          }else if((node.name == 'impl:Param') && assignblock && flowactive){
            paramflag = true;
          }

          //for testing
          /*if(mainsequenceactive){
            //console.log('<' + node.name + '>');
          }*/

          stack.push(node);

        };

//------------------------------------------------------------ onclosetag hier-----------------------------------------------------------------------------------

        //stack.top = parentNode!
        parser.onclosetag = function(tagname) {
          if(stack.size > 0){
            let cnode = stack.pop();
            if(cnode.name == 'scope' && !(cnode.attributes.name.includes('fault_') || cnode.attributes.name.includes('compensation_'))){

              if((inedges.length + outedges.length) > linkcounter){
                console.warn("there are more edges than the combined count of defined edges!")
              }
              scopes.push({scope: currentScope, incomingEdges: inedges, outgoingEdges: outedges}); //push infos and reset
              dataArr.push({scope: currentScope, data: scopedataArr});
              inedges = [];
              outedges = [];
              currentScope = "";
              scopedataArr = [];

            }else if(cnode.name == 'flow'){
              flowactive = false;

            }else if(cnode.name == 'faultHandlers'){
              faulthandler = false;
  
            }else if(cnode.name == 'compensationHandler'){
              compensationhandler = false;

            }else if(cnode.name == 'sequence' && cnode.attributes.hasOwnProperty('name')){
              if((cnode.attributes.name.includes('_mainSequence')) && !(cnode.attributes.name.includes('fault_') || cnode.attributes.name.includes('compensation_'))){
                mainsequenceactive = false;

              /*}else if(!(cnode.attributes.name.includes('_mainSequence')) && !(cnode.attributes.name.includes('fault_') || cnode.attributes.name.includes('compensation_'))){
                //console.log('</' + cnode.name + '>');*/
              }
              
            }else if((cnode.name == 'bpel:assign') && flowactive){
            // if nothing happens inside the assignblock
            if(assignarr.length == 0){
              assignarr.push({
                assignblock: assignblockname, 
                from: "", 
                frompart: "", 
                fromquery: "", 
                fromheader: "", 
                fromendpointReference: "", 
                frompartnerLink: "",
                to: "", 
                topart: "", 
                toquery: "", 
                toheader: "", 
                toendpointReference: "", 
                topartnerLink: ""});
            }
            assignblockname = "";

            /*//for testing
            if(mainsequenceactive){
            console.log(assignarr);
            }*/

            // add fault + compensationscope tags
            let tmpscope = currentScope;
            if(faulthandler){
              tmpscope = "fault_" + tmpscope;
            }else if(compensationhandler){
              tmpscope = "compensation_" + tmpscope;
            }

            scopedataArr.push({type: cnode.name, scope: tmpscope, data: assignarr});

            assignarr = [];
            assignblock = false;

            }else if((cnode.name == 'bpel:from') && flowactive && assignblock){
              hascdataf = false;

            }else if((cnode.name == 'bpel:to' ) && flowactive && assignblock){
              let resultassignobj = {assignblock: assignblockname, 
                              from: from, 
                              frompart: "", 
                              fromquery: "", 
                              fromheader: "", 
                              frompartnerLink: "",
                              fromendpointReference: "", 
                              to: to, 
                              topart: "", 
                              toquery: "", 
                              toheader: "", 
                              topartnerLink: "",
                              toendpointReference: "" 
                            };
              //add information if possible
              if(partf != ""){
                resultassignobj.frompart = partf; 
                //resultassignobj["frompart"] = partf; as alternative?
              }
              if(partt != ""){
                resultassignobj.topart = partt;
              }
              if(fromquery != ""){
                resultassignobj.fromquery = fromquery;
              }
              if(toquery != ""){
                resultassignobj.toquery = toquery;
              }
              if(headerf != ""){
                resultassignobj.fromheader = headerf;
              }
              if(headert != ""){
                resultassignobj.toheader = headert;
              }
              if(endpointReferencef != ""){
                resultassignobj.fromendpointReference = endpointReferencef;
              }
              if(endpointReferencet != ""){
                resultassignobj.toendpointReference = endpointReferencet;
              }
              if(partnerlinkf != ""){
                resultassignobj.frompartnerLink = partnerlinkf;
              }
              if(partnerlinkt != ""){
                resultassignobj.topartnerLink = partnerlinkt;
              }
              if((serviceinstanceid != "") && (targetinstanceid != "") && (sourceinstanceid != "")){
                resultassignobj["service-instance-id"] = serviceinstanceid;
                resultassignobj["source-instance-id"] = sourceinstanceid;
                resultassignobj["target-instance-id"] = targetinstanceid;
              }
              if(invokeoperationasynchvars.length > 0){
                resultassignobj["impl:invokeOperationAsynch information"] = invokeoperationasynchvars;
                resultassignobj.from = "literal impl:invokeOperationAsynch";
              }
              assignarr.push(resultassignobj);

              //reset for the next copy block
              hascdatat = false;
              from = "";
              to = "";
              fromquery = "";
              toquery = "";
              partf = "";
              partt = "";
              serviceinstanceid = "";
              targetinstanceid = "";
              sourceinstanceid = "";
              invokeoperationasynchvars = [];

            // add bpel:invoke data
            }else if((cnode.name == 'bpel:invoke') && flowactive && invokereceiveblock){
              let resultinvokeobj = {
                invokeblock: invokereceiveblockname,
                inputVariable: invokereceivevariable,
                operation: invokereceiveoperation,
                portType: invokereceiveporttype,
                partnerLink: invokereceivepartnerlink,
                correlationInitiate: correlationinitiate,
                correlationset: correlationset
              };

              // add fault + compensationscope tags
              let tmpscope = currentScope;
              if(faulthandler){
                tmpscope = "fault_" + tmpscope;
              }else if(compensationhandler){
                tmpscope = "compensation_" + tmpscope;
              }

              scopedataArr.push({type: cnode.name, scope: tmpscope, data: resultinvokeobj});

              //reset
              invokereceiveblockname = "";
              invokereceivevariable = "";
              invokereceiveporttype = "";
              invokereceiveoperation = "";        
              invokereceivepartnerlink = "";
              correlationinitiate = "";
              correlationset = "";
              invokereceiveblock = false;

            // add bpel:receive data 
            }else if((cnode.name == 'bpel:receive') && flowactive && invokereceiveblock){
              let resultreceiveobj = {
                invokeblock: invokereceiveblockname,
                variable: invokereceivevariable,
                operation: invokereceiveoperation,
                portType: invokereceiveporttype,
                partnerLink: invokereceivepartnerlink,
                correlationInitiate: correlationinitiate,
                correlationset: correlationset
              };

              // add fault + compensationscope tags
              let tmpscope = currentScope;
              if(faulthandler){
                tmpscope = "fault_" + tmpscope;
              }else if(compensationhandler){
                tmpscope = "compensation_" + tmpscope;
              }

              scopedataArr.push({type: cnode.name, scope: tmpscope, data: resultreceiveobj});

              //reset
              invokereceiveblockname = "";
              invokereceivevariable = "";
              invokereceiveporttype = "";
              invokereceiveoperation = "";        
              invokereceivepartnerlink = "";
              correlationinitiate = "";
              correlationset = "";
              invokereceiveblock = false;

            // close cdata input for bpel:condition
            }else if((cnode.name == 'bpel:condition') && flowactive){
              if(stack.top.name == 'bpel:if'){
                bpelif = false;
              }

            // bpel:literal reset  
            }else if((cnode.name == 'bpel:literal') && flowactive && assignblock){
              literalflag = false;
              wliteralflag = false;
              invokeoperationasynchflag = false;
              ioacounter = -1;

            // information from invokeoparationsasynch
            }else if(invokeoperationasynchflag && flowactive && assignblock && ioastring){
              ioastring = false;     

            // invokeoperationsasynch Params handler 
            }else if((cnode.name == 'impl:Param') && assignblock && flowactive){
              if(invokeoperationasynchparams.length == 2){
                invokeoperationasynchvars[0].Params.push({key: invokeoperationasynchparams[0], value: invokeoperationasynchparams[1]});
              }
              invokeoperationasynchparams = [];
              paramflag = false;
            }

            /*//for testing
            if(mainsequenceactive){
              //console.log('</' + cnode.name + '>');
            }*/
          }
        }

        //cdata handler
        parser.oncdata = function(cd){
          if(hascdataf){
            from = cd; 
            hascdataf = false;

            /*// for testing
            if(mainsequenceactive){
            console.log('cdata: ' + from);}*/

          }else if(hascdatat){
            to = cd; 
            hascdatat = false;

            /*// for testing
            if(mainsequenceactive){
            console.log('cdata: ' + to);}*/
          }else if(hascdatafv){
            fromquery = cd;
            hascdatafv = false;

          }else if(hascdatatv){
            toquery = cd;
            hascdatatv = false;
          }else if(bpelif){
            conditiondata = cd;
          }
        }

        // text handler
        // because of the way the parser works, the best way to handle ioa input is by using a counter to specify the input
        parser.ontext = function (t) {
          // got some text.  t is the string of text.
          if(t != " "){
            if(literalflag){
              from = "literal api:log= " + t;
            }else if(wliteralflag){
              from = "literal wsa:Address= " + t;
            }else if(invokeoperationasynchflag && ioastring) {
              switch (ioacounter) {
                case 0:
                  invokeoperationasynchvars[0].PlanCorrelationID = t;
                  break;
                case 1:
                  invokeoperationasynchvars[0].CsarID = t;
                  break;
                case 2:
                  invokeoperationasynchvars[0].ServiceInstanceID = t;
                  break;
                case 3:
                  invokeoperationasynchvars[0].ServiceTemplateIDNamespaceURI = t;
                  break;
                case 4: 
                  invokeoperationasynchvars[0].ServiceTemplateIDLocalPart = t;
                  break;
                case 5:
                  invokeoperationasynchvars[0].InterfaceName = t;
                  break;
                case 6:
                  invokeoperationasynchvars[0].NodeTemplateID = t;
                  break;
                case 7:
                  invokeoperationasynchvars[0].OperationName = t;
                  break;
                case 8:
                  invokeoperationasynchvars[0].ReplyTo = t;
                  break;
                case 9:
                  invokeoperationasynchvars[0].MessageID = t;
                  break;           
                default:
                  break;
              }
            }
            if(paramflag){
              invokeoperationasynchparams.push(t);
            }
          }
        
        };
        
        
        parser.onend = function () {
          // parser stream is done, and ready to have more stuff written to it.
          console.warn('end of XML parse');
        };
        
         parser.write(xml).close();

         //reihenfolge bestimmen (topologisch sortieren)
         let arraywithsorteddata = [];

         // muss nach linkcounter vielen schritten fertig sein da nur so viele Kanten existieren

         let scopecopy = scopes.map((x) => x);
         
         for (let c = 0; c < linkcounter+1; c++) {
           
           // 1. Schritt: für jede eingehende Kante wird überprüft, ob sie noch existieren darf -> ob sie in seqEdges enthalten ist
           //             falls nicht wird sie in incomingEdges des jeweiligen scopes gelöscht
           // First step: check for each incoming edge if it is contained in seqEdges[], 
           //             if not delete the correspondant edge in incomingEdges[] of the specific scope
           scopecopy.forEach(scope => {
             scope.incomingEdges.forEach(edge => {
               if(seqEdges.includes(edge) == false){
                 scope.incomingEdges.splice(scope.incomingEdges.indexOf(edge),1);
               }
             });
           });
          
           // 2. Schritt: für jede scope wird überprüft ob sie eingehende Kanten hat
           //             falls nicht werden alle ausgehenden Kanten des scopes in seqEdges gelöscht
           //             anschließend wird die scope ins sortierte array eingefügt und aus scopes entfernt
           // Second Step: Check for every scope, if it has incoming edges
           //              if not delete all outgoing edges of the specific scope in seqEdges[]
           //              then add the scope to the sorted array and remove it from scopes[]
           scopecopy.forEach(scope2 => {
            if(scope2.incomingEdges.length == 0){
              if(scope2.outgoingEdges.length > 0){
                scope2.outgoingEdges.forEach(edge => {
                  seqEdges.splice(seqEdges.indexOf(edge),1);
                });
              }
              arraywithsorteddata.push(scope2.scope);
              scopecopy.splice(scopecopy.indexOf(scope2),1);
           }
          });       
        }

         //scopes and seqEdges should be empty now
         if(scopecopy.length > 0){
           console.warn("error during sorting!");
         }
         
         let retarr = []; // contains all data in the right order

         //sort the data
         arraywithsorteddata.forEach(scope =>{
           dataArr.forEach(datascope => {
             if(datascope.scope === scope){
               retarr.push(datascope);
             }
           });
         });
         //console.log("array mit richtiger reihenfolge und allen daten:");
         //console.log(retarr);

         this.bpmncreator.createBpmn(this.modeler, retarr);

    }

}