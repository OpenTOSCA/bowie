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
import { NodeTemplate } from '../model/nodetemplate';
import { Node } from '../model/workflow/node';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ToscaInterface } from '../model/toscaInterface';
import JSZip from 'jszip';
import { CustomPropsProvider } from '../props-provider/CustomPropsProvider';
import { HttpClient } from '@angular/common/http';

/**
 * WineryService
 * provides operation about winery. It can load and save data from winery.
 */
@Injectable()
export class WineryService {

    private repositoryURL: string;
    private namespace: string;
    public serviceTemplateId: string;
    private plan: string;
    static nodetemplates2 = [{ name: 'Test', value: 'Test' }, { name: 'Test1', value: 'Test1' }];

    constructor(private broadcastService: BroadcastService,
        public httpService: HttpService,
        public http: HttpClient) {
        this.broadcastService.saveEvent$.subscribe(data => this.testsave(data));

    }

    public setRequestParam(queryParams: PageParameter) {
        this.repositoryURL = queryParams.repositoryURL;
        this.namespace = queryParams.namespace;
        this.serviceTemplateId = queryParams.id;
        this.plan = queryParams.plan;

        if (this.repositoryURL) {
            //this.loadPlan();
        }
    }
    public getFileNameOfArtifactTemplates(ref: string) {
        console.info("Compute file name of deployment artifacts")
        let httpserv = this.http;
        let namespace = ref.split('}')[0];
        namespace = namespace.replace('{', '');
        let da = ref.split('}')[1];
        const url = 'artifacttemplates/' + this.encode(namespace) + '/' + da + '/xml';
        const headers = new HttpHeaders({ 'Content-Type': 'application/xml' });
        httpserv.get(this.getFullUrl(url), {
            headers: headers, responseType: 'text'
        }).subscribe(response => {
            let parser = new DOMParser();
            let reference = parser.parseFromString(response, "text/xml").getElementsByTagName("ArtifactReference")[0].getAttribute("reference");
            let fileNameIndex = reference.lastIndexOf('/');
            let fileName = reference.substring(fileNameIndex + 1);
            CustomPropsProvider.references.push({
                name: ref, value: fileName
            })
        })

    }

    public loadNodeTemplates() {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/topologytemplate/';
        this.httpService.get(this.getFullUrl(url)).subscribe(response => {
            this.transferResponse2NodeTemplate(response);

            return response
        });
    }


    private transferResponse2NodeTemplate(response: any) {
        console.info("Transfer json to nodetemplates");
        for (const relation in response.relationshipTemplates) {
            if (response.relationshipTemplates.hasOwnProperty(relation)) {
                const relationshipTemplate = response.relationshipTemplates[relation];
                var containsParam = false;
                for (var j = 0; j < CustomPropsProvider.relationshiptemplate.length; j++) {
                    if (relationshipTemplate.id == CustomPropsProvider.relationshiptemplate[j].name) {
                        containsParam = true;
                    }
                }
                if (!containsParam) {
                    CustomPropsProvider.relationshiptemplate.push({
                        value: relationshipTemplate.id, name:
                            relationshipTemplate.id
                    });
                }
                if (CustomPropsProvider.template.length == 0) {
                    CustomPropsProvider.relationshiptemplate.push({
                        value: relationshipTemplate.id, name:
                            relationshipTemplate.id
                    });
                }
            }
        }
        const nodeTemplates: NodeTemplate[] = [];
        for (const key in response.nodeTemplates) {
            if (response.nodeTemplates.hasOwnProperty(key)) {
                const nodeTemplate = response.nodeTemplates[key];
                var containsParam = false;
                for (var j = 0; j < CustomPropsProvider.template.length; j++) {
                    if (nodeTemplate.id == CustomPropsProvider.template[j].name) {
                        containsParam = true;
                    }
                    if (nodeTemplate.deploymentArtifacts !== undefined) {
                        console.log(nodeTemplate.deploymentArtifacts);
                        for (var k = 0; k < nodeTemplate.deploymentArtifacts.length; k++) {
                            let ref = nodeTemplate.deploymentArtifacts[k].artifactRef;
                            this.getFileNameOfArtifactTemplates(ref);
                            let index = ref.indexOf("}");
                            let daName = ref.substring(index + 1);
                            CustomPropsProvider.DA.push({
                                value: daName, name:
                                    daName
                            });
                        }
                    }
                }
                if (!containsParam) {
                    CustomPropsProvider.template.push({
                        value: nodeTemplate.id, name:
                            nodeTemplate.id
                    });
                    CustomPropsProvider.properties.push(nodeTemplate);


                }
                if (CustomPropsProvider.template.length == 0) {
                    CustomPropsProvider.template.push({
                        value: nodeTemplate.id, name:
                            nodeTemplate.id
                    });
                    CustomPropsProvider.properties.push(nodeTemplate);
                    if (nodeTemplate.deploymentArtifacts != undefined) {
                        for (var k = 0; k < nodeTemplate.deploymentArtifacts.length; k++) {
                            let ref = nodeTemplate.deploymentArtifacts[k].artifactRef;
                            this.getFileNameOfArtifactTemplates(ref);
                            let index = ref.indexOf("}");
                            let daName = ref.substring(index + 1);
                            CustomPropsProvider.DA.push({
                                value: daName, name:
                                    daName
                            });
                        }
                    }
                }
                nodeTemplates.push(new NodeTemplate(
                    nodeTemplate.id,
                    nodeTemplate.name,
                    nodeTemplate.type,
                    nodeTemplate.type.replace(/^\{(.+)\}(.+)/, '$1')));
            }
        }
        console.log(nodeTemplates);
        return nodeTemplates;
    }

    public loadNodeTemplateInterfaces(namespace: string, nodeType: string): Observable<ToscaInterface[]> {
        const url = 'nodetypes/' + this.encode(namespace)
            + '/' + this.encode(nodeType) + '/interfaces/';
        console.log('Interface');
        console.log(this.httpService.get(this.getFullUrl(url)));
        return this.httpService.get(this.getFullUrl(url));
    }

    handleError(err: any) {
        if (err) {
            //console.warn('Ups, error: ', err);
        }
    }

    public testsave2(xml: string): void {
        let httpserv = this.http;
        let testzip = new JSZip();
        let counter = 0;
        let retstring = "";
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        const fullUrl = this.getFullUrl(url);

        let requestData = '-----------------------------7da24f2e50046\r\n'
            + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
            + 'Content-type: plain/text\r\n\r\n'
            + xml + '\r\n-----------------------------7da24f2e50046';

        //const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046' });
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        //this.httpService.put(this.getFullUrl(url), requestData, { headers: headers })
        //    .subscribe(response => console.log('save date success'));


        const url2 = [
            "../../assets/SetState.groovy",
            "../../assets/SetProperties.groovy",
            "../../assets/DataObject.groovy",
            "../../assets/CreateServiceInstance.groovy",
            "../../assets/CreateRelationshipInstance.groovy",
            "../../assets/CreateNodeInstance.groovy",
            "../../assets/CallNodeOperation.groovy"];
        url2.forEach((urlll) => {
            const filename = urlll.split('/')[urlll.split('/').length - 1];

            httpserv.get(urlll, {
                headers: { observe: 'response' }, responseType: 'text'
            }).subscribe(
                (y: any) => {
                    next:
                    testzip.file(filename, y);
                    retstring += JSON.stringify(y) + '\r\n';
                    /*
                    requestData += '\r\nContent-Disposition: form-data; name= "file' + counter + '"; filename= "' + filename + '"\r\n'
                        + 'Content-type: plain/text\r\n\r\n'
                        + JSON.stringify(y) + '\r\n-----------------------------7da24f2e50046';
                      */
                    if (counter < 1) {
                        //httpserv.put(fullUrl, requestData, { headers: headers })
                        //    .subscribe(response => {
                        //        console.log('save date success');
                        //        console.log(fullUrl);
                        //    });
                    }
                    counter++;
                    if (counter === url2.length) {
                        requestData += '\r\nContent-Disposition: form-data; name= "file' + counter + '"; filename= "' + filename + '"\r\n'
                            + 'Content-type: plain/text\r\n\r\n'
                            + JSON.stringify(y) + '\r\n-----------------------------7da24f2e50046';
                        requestData += '--';
                        retstring += xml;
                        console.log(requestData);
                        testzip.file("insertplannamehere.bpmn", xml);
                        testzip.generateAsync({ type: "blob" })
                            .then(function (content) {

                                console.log(content);
                                httpserv.put<any>(fullUrl, retstring, { headers: headers })
                                    .subscribe(response => {
                                        console.log('save date success');
                                        console.log(fullUrl);
                                    });
                            });
                    }
                });

        });

    }

    /*
      public async asynchtest(xml2: string) {
  
       const test = await this.testsave(xml2);
       console.log(test);
       
          const url = 'servicetemplates/' + this.encode(this.namespace)
              + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
          const fullUrl = this.getFullUrl(url);
          
          const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary= -----------------------------7da24f2e50046' });
          //const headers = new HttpHeaders({ 'Content-Type': 'application/zip' });
          const requestData =// 'multipart/form-data; boundary=7da24f2e50046 +'
              '-----------------------------7da24f2e50046\r\n'
              + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
              // + 'Content-type: application/x-zip-compressed\r\n\r\n'
              + 'Content-type: plain/text\r\n\r\n'
              + xml2 + /*content + '\r\n-----------------------------7da24f2e50046--\r\n';
  
          this.httpService.put(fullUrl, requestData, {headers: headers})
              .subscribe(response => {console.log('save date success'); console.log(fullUrl); });
      }
      */


    public testsave(xml: string) {
        let zip2 = new JSZip();
        let count = 0;
        let blobcontent;
        let formData = new FormData();
        const httpcli = this.http;
        const httpservice = this.httpService;
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        let fullUrl = this.getFullUrl(url);
        //fullUrl = "http://localhost:4567/winery/servicetemplates/http%253A%252F…%252Fservicetemplates/MyTinyToDo_Bare_Docker/plans/dada/file";
        // const headers = new HttpHeaders({ 'Content-Type': 'application/zip' });
        const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046' });
        console.log("fullUrl");
        console.log(fullUrl);
        const url2 = [
            "../../assets/SetState.groovy",
            "../../assets/SetProperties.groovy",
            "../../assets/CreateServiceInstance.groovy",
            "../../assets/DataObject.groovy",
            "../../assets/CreateRelationshipInstance.groovy",
            "../../assets/CreateNodeInstance.groovy",
            "../../assets/CallNodeOperation.groovy"];
        url2.forEach((urlll) => {
            const filename = urlll.split('/')[urlll.split('/').length - 1];

            this.http.get(urlll, {
                headers: { observe: 'response' }, responseType: 'text'
            }).subscribe(
                (y: any) => {
                    next: zip2.file(filename, y);
                    count++;
                    if (count === url2.length) {
                        zip2.file("insertplannamehere.bpmn", xml);
                        zip2.generateAsync({ type: "blob" })
                            .then(function (content) {

                                const fd = new FormData();
                                fd.append('overwrite', 'false');
                                fd.append('file', content, 'plan.zip');
                                httpcli.put(fullUrl, fd)
                                    .subscribe(response => { console.log('save date success'); console.log(fullUrl); });
                                //httpcli.put(fullUrl, content, {headers: headers})
                                //    .subscribe(response => {console.log('save date success'); console.log(fullUrl); });


                            });
                    }
                    error: this.handleError(y);
                });

        });



        //const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data' });
        //formData.append('file', blobcontent);

        /*
        this.httpService.put(this.getFullUrl(url), formData, { headers: headers })
            .subscribe(response => {console.log('save date success'); console.log(this.getFullUrl(url)); });
            
        
        
        this.httpService.put(this.getFullUrl(url), formData)
            .subscribe(response => {console.log('save date success'); console.log(this.getFullUrl(url)); });
        */
        /*
        return new Promise(resolve => {
            resolve('resolved');
        });
        */

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
            return nodes;
        });
    }


    loadPlan2(modeler: any) {

        let url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        console.log(url);
        url = this.getFullUrl(url);

        return new Promise(function () {

            // request zip file representing plan
            const xmlhttp = new XMLHttpRequest();
            xmlhttp.responseType = 'blob';
            xmlhttp.onload = async function (callback) {
                if (xmlhttp.status === 200) {
                    console.log('Request finished with status code 200 for plan at path %s!', url);
                    const blob = new Blob([xmlhttp.response], { type: 'application/zip' });

                    // load zip file using JSZip
                    let jszip = new JSZip();
                    let zip = await jszip.loadAsync(blob);
                    console.log('Successfully loaded zip!', zip);

                    // find BPMN file in QAA
                    let files = zip.filter(function (relativePath, file) {
                        return !relativePath.startsWith('deployment-models') && relativePath.endsWith('.bpmn');
                    });
                    console.log(files[0]);


                    // check if exaclty one workflow is contained in the QAA
                    if (files.length !== 1) {
                        console.error('Plan with path %s must contain exactly one BPMN file but contains %i!', url, files.length);

                    }
                    console.log(files[0]);
                    console.log(files);
                    let bpmn = await files[0].async('string');
                    modeler.importXML(bpmn);
                    return bpmn;

                }
            };
            xmlhttp.open('GET', url, true);
            xmlhttp.send();
        });
    }

    loadPlanBPEL(modeler: any, bpelService: any) {
        let planName = this.plan.split('/bpel')[0];
        let url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(planName) + '/file';
        console.log(url);
        url = this.getFullUrl(url);

        return new Promise(function () {

            // request zip file representing plan
            const xmlhttp = new XMLHttpRequest();
            xmlhttp.responseType = 'blob';
            xmlhttp.onload = async function (callback) {
                if (xmlhttp.status === 200) {
                    console.log('Request finished with status code 200 for plan at path %s!', url);
                    const blob = new Blob([xmlhttp.response], { type: 'application/zip' });

                    // load zip file using JSZip
                    let jszip = new JSZip();
                    let zip = await jszip.loadAsync(blob);
                    console.log('Successfully loaded zip!', zip);

                    // find BPEL file in QAA
                    let files = zip.filter(function (relativePath, file) {
                        return !relativePath.startsWith('deployment-models') && relativePath.endsWith('.bpel');
                    });
                    console.log(files[0]);


                    // check if exaclty one workflow is contained in the QAA
                    if (files.length !== 1) {
                        console.error('Plan with path %s must contain exactly one BPEL file but contains %i!', url, files.length);

                    }

                    let bpel = await files[0].async('string');
                    bpelService.bpelspass(bpel, modeler);
                    return bpel;

                }
            };
            xmlhttp.open('GET', url, true);
            xmlhttp.send();
        });
    }


    private encode(param: string): string {
        return encodeURIComponent(encodeURIComponent(param));
    }

    private getFullUrl(relativePath: string) {
        return this.repositoryURL + relativePath;
    }
}
