import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TimeRangeSliderComponent } from './components/time-range-slider/time-range-slider.component';

@NgModule({
  declarations: [
    AppComponent,
    TimeRangeSliderComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
