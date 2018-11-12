import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-time-range-slider';

  constructor(){

  }

  onChange(event){
    //console.log(event);
  }

  onChangeSync(event){
    //console.log(event);
  }
}
