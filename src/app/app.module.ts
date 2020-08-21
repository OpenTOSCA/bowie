import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { WineryService } from './services/winery.service';
import { BroadcastService } from './services/broadcast.service';
import { AppComponent } from './app.component';
import { HttpService } from './util/http.service';
import {HttpClientModule, HttpClient, HttpHandler} from '@angular/common/http';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, RouterModule.forRoot([])
  ],
  providers: [BroadcastService, WineryService, HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
