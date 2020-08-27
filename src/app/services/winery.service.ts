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
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        
        const requestData = '-----------------------------7da24f2e50046\r\n'
            + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
            + 'Content-type: plain/text\r\n\r\n'
            + data + '\r\n-----------------------------7da24f2e50046--\r\n';
        
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
