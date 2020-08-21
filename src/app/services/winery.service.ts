/*******************************************************************************
 * Copyright (c) 2017-2019 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 *******************************************************************************/

import { Injectable } from '@angular/core';

import { PageParameter } from '../model/page-parameter';
import { Node } from '../model/workflow/node';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { HttpHeaders } from '@angular/common/http';

/**
 * WineryService
 * provides operation about winery. It can load and save data from winery.
 */
@Injectable()
export class WineryService {
    private repositoryURL: string;
    private namespace: string;
    private serviceTemplateId: string;
    private plan: string;

    constructor(private broadcastService: BroadcastService,
                private httpService: HttpService) {
        this.broadcastService.saveEvent$.subscribe(data => this.save(data));
    }

    public setRequestParam(queryParams: PageParameter) {
        this.repositoryURL = queryParams.repositoryURL;
        this.namespace = queryParams.namespace;
        this.serviceTemplateId = queryParams.id;
        this.plan = queryParams.plan;

        if (this.repositoryURL) {
            this.loadPlan();
        }
    }


    public save(data: string) {
        console.log(data);
        console.log(this.namespace);
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        let xml: string;
        xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n' +
            '<bpmn:process id="Process_1" isExecutable="false">\n' +
            '<bpmn:startEvent id="StartEvent_1">\n' +
            '<bpmn:outgoing>SequenceFlow_0e3dski</bpmn:outgoing>\n' +
            '</bpmn:startEvent>\n' +
            '<bpmn:intermediateThrowEvent id="IntermediateThrowEvent_14m4gg5">\n' +
            '<bpmn:incoming>SequenceFlow_0e3dski</bpmn:incoming>\n' +
            '</bpmn:intermediateThrowEvent>\n' +
            '<bpmn:sequenceFlow id="SequenceFlow_0e3dski" sourceRef="StartEvent_1" targetRef="IntermediateThrowEvent_14m4gg5" />\n' +
            '</bpmn:process>\n' +
            '<bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
            '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n' +
            '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"><dc:Bounds x="173" y="102" width="36" height="36" />\n' +
            '</bpmndi:BPMNShape><bpmndi:BPMNShape id="IntermediateThrowEvent_14m4gg5_di" bpmnElement="IntermediateThrowEvent_14m4gg5">\n' +
            '<dc:Bounds x="358" y="135" width="36" height="36" />\n' +
            '</bpmndi:BPMNShape><bpmndi:BPMNEdge id="SequenceFlow_0e3dski_di" bpmnElement="SequenceFlow_0e3dski">\n' +
            '<di:waypoint x="209" y="120" />\n' +
            '<di:waypoint x="284" y="120" />\n' +
            '<di:waypoint x="284" y="153" />\n' +
            '<di:waypoint x="358" y="153" />\n' +
            '</bpmndi:BPMNEdge>\n' +
            '</bpmndi:BPMNPlane>\n' +
            '</bpmndi:BPMNDiagram>\n' +
            '</bpmn:definitions>';
        console.log(JSON.stringify(xml));
        
        
        const requestData = '-----------------------------7da24f2e50046\r\n'
            + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
            + 'Content-type: plain/text\r\n\r\n'
            + data + '\r\n-----------------------------7da24f2e50046--\r\n';
        console.log(this.getFullUrl(url));
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xml, "text/xml");
        console.log(xmlDoc);
        console.log(xmlDoc.getElementsByTagName('bpmn:startEvent'));
        console.log(xmlDoc.getElementsByTagName('bpmn:sequenceFlow')[0].getAttribute('sourceRef'));
        const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046' });

        this.httpService.put(this.getFullUrl(url), requestData, { headers: headers })
            .subscribe(response => console.log('save date success'));
    }

    public loadPlan() {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        this.httpService.get(this.getFullUrl(url)).subscribe(response => {
            const nodes = JSON.stringify(response) === '{}' ? [] : <Node[]>response;
            console.log(this.broadcastService.planModel);
            console.log(nodes);
            this.broadcastService.broadcast(this.broadcastService.planModel, nodes);
            console.log("hier");
            return nodes;});
    }

    public loadPlan2(modeler:any) {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        this.httpService.get(this.getFullUrl(url)).subscribe(response => {
            const nodes = JSON.stringify(response) === '{}' ? [] : <Node[]>response;
            console.log(this.broadcastService.planModel);
            console.log(nodes);
            this.broadcastService.broadcast(this.broadcastService.planModel, nodes);
            console.log("hier");
            modeler.importXML(nodes);
            return nodes;});
    }
    


    private encode(param: string): string {
        return encodeURIComponent(encodeURIComponent(param));
    }

    private getFullUrl(relativePath: string) {
        return this.repositoryURL + relativePath;
    }
}
