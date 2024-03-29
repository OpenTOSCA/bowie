import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Modeler, OriginalPropertiesProvider, PropertiesPanelModule, InjectionNames, OriginalPaletteProvider, OriginalRenderer} from "./bpmn-js/bpmn-js";
import {CustomPropsProvider} from './props-provider/CustomPropsProvider';
import CustomPaletteProvider from "./props-provider/CustomPaletteProvider";
import CustomRenderer from "./props-provider/CustomRenderer";
import {WineryService} from "./services/winery.service";
import { ActivatedRoute, Params } from '@angular/router';
import { PageParameter } from './model/page-parameter';
import _camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";
import moddle from '../docs/moddle.json';
import PathMap from './bpmn-js/draw/PathMap';
//import SituationPropertiesProvider from './provider/situations/SituationPropertiesProvider';
import {BpelService} from './services/bpelparser.service';



const customModdle = {
  name: "customModdle",
  uri: "http://example.com/custom-moddle",
  prefix: "custom",
  xml: {
    tagAlias: "lowerCase"
  },
  associations: [],
  types: [
    {
      "name": "ExtUserTask",
      "extends": [
        "bpmn:UserTask"
      ],
      "properties": [
        {
          "name": "worklist",
          "isAttr": true,
          "type": "String"
        }
      ]
    },
  ]
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'bpmn.io for Winery';
  modeler;
  static options = [{ name: 'Test3', value: 'Test3' }, { name: 'Test4', value: 'Test4' }];
  s: any;
  static interfaces =  [{ name: 'Test3', value: 'Test3' }, { name: 'Test4', value: 'Test4' }];
  static param : Params;
  static winery2: WineryService;
  
  constructor(private http: HttpClient, private route: ActivatedRoute,private wineryService: WineryService, private bpelservice: BpelService) {
  }

  ngOnInit(): void {
    this.modeler = new Modeler({
      keyboard: { bindTo: document },
      container: '#canvas',
      width: '100%',
      height: '600px',
      additionalModules: [
        PropertiesPanelModule,
        OriginalPropertiesProvider,
        {[InjectionNames.bpmnPropertiesProvider]: ['type', OriginalPropertiesProvider.propertiesProvider[1]]},
        {[InjectionNames.propertiesProvider]: ['type', CustomPropsProvider]},
        
        {[InjectionNames.bpmnRenderer]: ['type', OriginalRenderer]},
        {[InjectionNames.pathMap]: ['type', PathMap]},
        {[InjectionNames.renderer]: ['type', CustomRenderer]},
        {[InjectionNames.originalPaletteProvider]: ['type', OriginalPaletteProvider]},
        {[InjectionNames.paletteProvider]: ['type', CustomPaletteProvider]},
       
      ],
      propertiesPanel: {
        parent: '#properties'
      },
      moddleExtensions: {
        custom: _camundaModdleDescriptor,
        qa: moddle
      }
    });
    
    this.route.queryParams.subscribe(params => {this.wineryService.setRequestParam(<PageParameter>params);
      //AppComponent.winery2 = this.wineryService;
    CustomPropsProvider.winery2 = this.wineryService
  });
    this.route.queryParams.forEach(params => {if(params.plan != undefined){
           let bpelPlan = params.plan.includes('bpel');
           if(bpelPlan){
            this.initiateBPEL();
          }
          // this step is also important for bpel plans to initiate a process id
          this.initiate();
          
    }})
    
  }

  handleError(err: any) {
    if (err) {
      console.warn('Ups, error: ', err);
    }
  }

  initiateBPEL(){
    this.wineryService.loadPlanBPEL(this.modeler, this.bpelservice);
  }

  initiate(){
    const url = '/assets/bpmn/initial.bpmn';
    this.http.get(url, {
      headers: {observe: 'response'}, responseType: 'text'
    }).subscribe(
      (x: any) => {
        console.log('Fetched XML, now importing: ', x);
        this.modeler.importXML(x, this.handleError);
        
      },
      this.handleError
    );
    
  }

  load(){
    this.wineryService.loadPlan2(this.modeler);
  }

  testsave(): void {
        this.modeler.saveXML((err: any, xml: any) => {
            console.log('Result of saving XML: ', err, xml);
            //let temp2 = JSON.stringify(xml);
            this.wineryService.testsave(xml);
        });
    }
    
    
}
