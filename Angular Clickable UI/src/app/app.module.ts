import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DisplayImageComponent } from './display-image/display-image.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import {HttpClientModule} from 
    '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    DisplayImageComponent,
    FileUploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
