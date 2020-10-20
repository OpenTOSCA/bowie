import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Modeler, OriginalPropertiesProvider, PropertiesPanelModule, InjectionNames, OriginalPaletteProvider} from "./bpmn-js/bpmn-js";
import {CustomPropsProvider} from './props-provider/CustomPropsProvider';
import CustomPaletteProvider from "./props-provider/CustomPaletteProvider";
import {WineryService} from "./services/winery.service";
import { ActivatedRoute, Params } from '@angular/router';
import { PageParameter } from './model/page-parameter';
import _camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";



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
  
  constructor(private http: HttpClient, private route: ActivatedRoute,private wineryService: WineryService) {
  }

  ngOnInit(): void {
    this.modeler = new Modeler({
      container: '#canvas',
      width: '100%',
      height: '600px',
      additionalModules: [
        PropertiesPanelModule,
        OriginalPropertiesProvider,

        {[InjectionNames.bpmnPropertiesProvider]: ['type', OriginalPropertiesProvider.propertiesProvider[1]]},
        {[InjectionNames.propertiesProvider]: ['type', CustomPropsProvider]},

        {[InjectionNames.originalPaletteProvider]: ['type', OriginalPaletteProvider]},
        {[InjectionNames.paletteProvider]: ['type', CustomPaletteProvider]},
      ],
      propertiesPanel: {
        parent: '#properties'
      },
      moddleExtensions: {
        custom: _camundaModdleDescriptor
      }
    });
    
    this.route.queryParams.subscribe(params => {this.wineryService.setRequestParam(<PageParameter>params)
    CustomPropsProvider.winery2 = this.wineryService});

    this.initiate();
    
  }

  handleError(err: any) {
    if (err) {
      console.warn('Ups, error: ', err);
    }
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
    console.log(this.wineryService);
    this.wineryService.loadNodeTemplates();
    this.s = this.wineryService.loadNodeTemplates();

    let namespace = "http://opentosca.org/nodetypes";
    this.wineryService.loadNodeTemplateInterfaces(namespace,'MyTinyToDoDockerContainer');

    //this.wineryService.loadPlan2(this.modeler);
    
  }

  save(): void {
    this.modeler.saveXML((err: any, xml: any) => {console.log('Result of saving XML: ', err, xml);
    let temp = JSON.stringify(xml);
   // this.wineryService.save(temp);
  });
    
    
}}
