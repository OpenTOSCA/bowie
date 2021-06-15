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
import { saveAs } from 'file-saver';
import { PageParameter } from '../model/page-parameter';
import { NodeTemplate } from '../model/nodetemplate';
import { Node } from '../model/workflow/node';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Rx';
import { ToscaInterface } from '../model/toscaInterface';
import JSZip from 'jszip';
import { AppComponent } from '../app.component';
import { CustomPropsProvider } from '../props-provider/CustomPropsProvider';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

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
        this.broadcastService.saveEvent$.subscribe(data => this.save(data));

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

    public loadNodeTemplates() {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/topologytemplate/';
        console.log(this.namespace);
        console.log(this.serviceTemplateId);
        this.httpService.get(this.getFullUrl(url)).subscribe(response => {
            this.transferResponse2NodeTemplate(response);

            return response
        });
    }


    private transferResponse2NodeTemplate(response: any) {
        console.log(response);
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
                }
                if (!containsParam) {
                    CustomPropsProvider.template.push({
                        value: nodeTemplate.id, name:
                            nodeTemplate.id
                    });
                    CustomPropsProvider.properties.push(nodeTemplate);
                    if (nodeTemplate.deploymentArtifacts != undefined) {
                        for (var k = 0; k < nodeTemplate.deploymentArtifacts.deploymentArtifact.length; k++) {
                            let ref = nodeTemplate.deploymentArtifacts.deploymentArtifact[k].artifactRef
                            let index = ref.indexOf("}");
                            let temp = ref.substring(index + 1);
                            CustomPropsProvider.DA.push({
                                value: temp, name:
                                    temp
                            });
                        }
                    }
                }
                if (CustomPropsProvider.template.length == 0) {
                    CustomPropsProvider.template.push({
                        value: nodeTemplate.id, name:
                            nodeTemplate.id
                    });
                    CustomPropsProvider.properties.push(nodeTemplate);
                    if (nodeTemplate.deploymentArtifacts != undefined) {
                        for (var k = 0; k < nodeTemplate.deploymentArtifacts.length; k++) {
                            CustomPropsProvider.DA.push({
                                value: nodeTemplate.deploymentArtifacts.deploymentArtifact[k].artifactRef, name:
                                    nodeTemplate.deploymentArtifacts.deploymentArtifact[k].artifactRef
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
        console.log("NODETEM");
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
                        zip2.file("insertplannamehere.bpmn", xml, { binary: true });
                        zip2.generateAsync({ type: "base64" })
                            .then(function (content) {

                                // see FileSaver.js
                                // const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary= -----------------------------7da24f2e50046' });
                                // const headers = new HttpHeaders({ 'Content-Type': 'application/zip' });
                                const requestData = '-----------------------------7da24f2e50046\r\n'
                                    + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.zip\"\r\n'
                                    + 'Content-type: application/zip\r\n\r\n'
                                    //+ 'Content-type: plain/text\r\n\r\n'
                                    + content + /*content +*/ '\r\n-----------------------------7da24f2e50046--\r\n';

                                blobcontent = content;

                                //saveAs(content, "example.zip");
                                /*
                                let fils = new File([content], 'example.zip', {type: "application/zip"});
                                formData.append('file', fils, 'example.zip');
                                console.log(fils);
                                 */

                                // https://github.com/Stuk/jszip/issues/312 das hier hilft

                                //console.log(content);
                                console.log(requestData);
                                httpcli.put(fullUrl, requestData, { headers: headers })
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

    public save(data: string) {
        /*     var zip = new JSZip();
             //let data2;
             
             
             //const url2 = "../../assets/SetState.groovy";
             /*
             this.http.get(url2, {
                 headers: {observe: 'response'}, responseType: 'text'
             }).subscribe(
                 (y: any) => {
                     next: data2 = y;
                     error: this.handleError(y);
                 });
             
             const url = 'servicetemplates/' + this.encode(this.namespace)
                 + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
             console.log(url);
             const requestData = '-----------------------------7da24f2e50046\r\n'
                 + 'Content-Disposition: form-data; name=\"file\"; filename=\"example.zip\"\r\n'
                 + 'Content-type: application/zip\r\n\r\n'
                 + data + '\r\n-----------------------------7da24f2e50046--\r\n';
                 /*
                 + 'Content-Disposition: form-data; name="file2;\r\n\r\n"'
                 + 'hallo\r\n' + '\r\n-----------------------------7da24f2e50046--\r\
                 
                  
                 zip.file("file.json", requestData);
                 
                 /*
                 console.log("mach was");
                 let dataaa = this.getsomedata();
                 console.log(dataaa);
                 zip.file("SetState.groovy", dataaa);
                 
                 // zip.file("SetState.groovy", "../../assets/SetState.groovy");
                 zip.generateAsync({type: "blob"})
                 .then(function(content) {
                     // see FileSaver.js
                     saveAs(content, "example.zip");
                 });
                 
             const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046' });
            
             this.httpService.put(this.getFullUrl(url), requestData, { headers: headers })
                 .subscribe(response => {console.log('save date success');console.log(this.getFullUrl(url))});
            */
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';

        const requestData = '-----------------------------7da24f2e50046\r\n'
            + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
            + 'Content-type: plain/text\r\n\r\n'
            + data + '\r\n-----------------------------7da24f2e50046--\r\n';
        let fullurl = this.getFullUrl(url);
        //fullurl = "http://localhost:4567/winery/servicetemplates/http%253A%252F…%252Fservicetemplates/MyTinyToDo_Bare_Docker/plans/dada/file";

        const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046' });
        //const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        //this.httpService.put(this.getFullUrl(url), requestData, { headers: headers })
        //    .subscribe(response => console.log('save date success'));

        this.httpService.put(fullurl, requestData, { headers: headers })
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
            return nodes;
        });
    }



    public loadPlan2(modeler: any) {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        console.log(url);
        /*
        this.httpService.get(this.getFullUrl(url)).subscribe(response => {
            const nodes = JSON.stringify(response) === '{}' ? [] : <Node[]>response;
          */
        const brdcst = this.broadcastService;
        this.http.get(this.getFullUrl(url), { responseType: 'text' })
            .subscribe(response => {
                console.log(response);
                JSZip.loadAsync(response, { base64: true }).then(function (contentofzip) {
                    return contentofzip.file("insertplannamehere.bpmn").async("string");
                }).then(function (text) {
                    console.log(text);
                    brdcst.broadcast(brdcst.planModel, text);
                    modeler.importXML(text);
                    return text;
                });
            }, error => { console.log(error); });

        /*
        console.log(this.broadcastService.planModel);
        //console.log(nodes);
        this.broadcastService.broadcast(this.broadcastService.planModel, nodes);
        console.log("hier");
        modeler.importXML(nodes);
        return nodes;
        */
        // });


    }

    /*
    private base64ToBuffer(str){
        str = window.atob(str); // creates a ASCII string
        var buffer = new ArrayBuffer(str.length),
            view = new Uint8Array(buffer);
        for(var i = 0; i < str.length; i++){
            view[i] = str.charCodeAt(i);
        }
        return buffer;
    }
    */


    private encode(param: string): string {
        return encodeURIComponent(encodeURIComponent(param));
    }

    private getFullUrl(relativePath: string) {
        return this.repositoryURL + relativePath;
    }
}
