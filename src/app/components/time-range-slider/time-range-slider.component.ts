import { Component, OnInit, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-time-range-slider',
  templateUrl: './time-range-slider.component.html',
  styleUrls: ['./time-range-slider.component.scss']
})
export class TimeRangeSliderComponent implements OnInit {
  @Input('width') sliderContainerWidth: number = 500;
  @Input('range') range: Array<number> = [0, 100];
  @Input('periodInMinute') periodInMinute: number = 15;
  @Input('timeRange') timeRange: Array<number> = null;
  @Output('onChange') onChange: EventEmitter<any> = new EventEmitter();
  @Output('onChangeSync') onChangeSync: EventEmitter<any> = new EventEmitter();

  @ViewChild('hilightBar') hilightBar: ElementRef;
  @ViewChild('clickBar') clickBar: ElementRef;
  @ViewChild('pointerLeft') pointerLeft: ElementRef;
  @ViewChild('pointerRight') pointerRight: ElementRef;

  @HostListener('document:mousemove', ['$event']) onMouseMove(event) {
    this.movePointer(event);
  }

  @HostListener('document:mouseup', ['$event']) onMouseUp(event) {
    if (this.mouseClickedOnLeftPointer || this.mouseClickedOnRightPointer) {
      this.onChange.emit({ range: this.range, selectedTimeRange: this.selectedTimeRange, selectedTime: [this.leftToolTip, this.rightToolTip] });
    }
    this.mouseClickedOnLeftPointer = false;
    this.mouseClickedOnRightPointer = false;
  }

  hilightWidth: number = 0;
  pointerLeftPosition: number = 0;
  pointerRightPosition: number = 0;
  maximumWidth: number = 0;

  mouseClickedOnLeftPointer: boolean = false;
  mouseClickedOnRightPointer: boolean = false;

  clientCoordinates = null;

  positionXDifference: number = null;

  pointerleftIndex: number = 1;
  pointerRightIndex: number = 0;

  toolTipPosXAdj: number = 32;

  leftToolTip: string = 'a';
  rightToolTip: string = 'b';

  selectedTimeRange: any = [];

  constructor() { }

  ngOnChanges() {
    //console.log(this.range);
    this.maximumWidth = this.clickBar.nativeElement.offsetWidth - this.pointerLeft.nativeElement.offsetWidth;
    this.pointerLeftPosition = this.getPositionByRange(this.range[0]);
    this.pointerRightPosition = this.getPositionByRange(this.range[1]);
    this.hilightWidth = this.pointerRightPosition - this.pointerLeftPosition;
    //console.log(this.pointerLeftPosition, this.pointerRightPosition);

    if (this.timeRange) {
      this.selectedTimeRange[0] = this.getTimeByRange(this.range[0]);
      this.selectedTimeRange[1] = this.getTimeByRange(this.range[1]);
      this.leftToolTip = String(this.convertTimeRangeToDigitalClock(this.getTimeByRange(this.range[0])));
      this.rightToolTip = String(this.convertTimeRangeToDigitalClock(this.getTimeByRange(this.range[1])));
    } else {
      this.leftToolTip = String(this.range[0]);
      this.rightToolTip = String(this.range[1]);
    }
  }

  ngOnInit() {

  }

  movePointer(event) {
    if (this.mouseClickedOnRightPointer || this.mouseClickedOnLeftPointer) {
      this.clientCoordinates = this.getClientCoordinatesFromEvent(event);
      var elementClientRect = this.clickBar.nativeElement.getBoundingClientRect();
      var positionXDifference = this.clientCoordinates.clientX - elementClientRect.left;
      var positionX = positionXDifference - this.positionXDifference;
      (positionX <= 0) ? positionX = 0 : '';
      (positionX >= this.maximumWidth) ? positionX = this.maximumWidth : '';
      //console.log(elementClientRect.left, this.clientCoordinates.clientX, positionXDifference);
    }
    if (this.mouseClickedOnLeftPointer) {
      if (positionX >= this.pointerRightPosition) {
        positionX = this.pointerRightPosition;
      }
      this.pointerLeftPosition = positionX;
      this.range[0] = this.getRangeByPosition(this.pointerLeftPosition);
      this.range[1] = this.getRangeByPosition(this.pointerRightPosition);
      let selectedTime = this.getTimeByPosition(positionX);
      this.leftToolTip = String(this.convertTimeRangeToDigitalClock(selectedTime));
      this.onChangeSync.emit({ range: this.range, selectedTimeRange: this.selectedTimeRange });
    } else if (this.mouseClickedOnRightPointer) {
      if (positionX <= this.pointerLeftPosition) {
        positionX = this.pointerLeftPosition;
      }
      this.pointerRightPosition = positionX;
      this.range[0] = this.getRangeByPosition(this.pointerLeftPosition);
      this.range[1] = this.getRangeByPosition(this.pointerRightPosition);
      let selectedTime = this.getTimeByPosition(positionX);
      this.rightToolTip = String(this.convertTimeRangeToDigitalClock(selectedTime));
      this.onChangeSync.emit({ range: this.range, selectedTimeRange: this.selectedTimeRange, selectedTime: [this.leftToolTip, this.rightToolTip] });
    }
    if (this.mouseClickedOnRightPointer || this.mouseClickedOnLeftPointer) {
      this.hilightWidth = this.pointerRightPosition - this.pointerLeftPosition;
      if (this.timeRange) {
        this.selectedTimeRange[0] = this.getTimeByRange(this.range[0]);
        this.selectedTimeRange[1] = this.getTimeByRange(this.range[1]);
        //this.leftToolTip = String(this.convertTimeRangeToDigitalClock(this.getTimeByRange(this.range[0])));
        //this.rightToolTip = String(this.convertTimeRangeToDigitalClock(this.getTimeByRange(this.range[1])));
      } else {
        //this.leftToolTip = String(this.range[0]);
        //this.rightToolTip = String(this.range[1]);
      }
    }
  }

  mouseDownOnClickBar(event: any) {
    //console.log((event.target.classList.contains('slider-click-bar')));
    if (event && event.target && event.target.classList && event.target.classList.contains('slider-click-bar')) {
      this.clientCoordinates = this.getClientCoordinatesFromEvent(event);
      var elementClientRect = this.clickBar.nativeElement.getBoundingClientRect();
      let positionXDifference = this.clientCoordinates.clientX - elementClientRect.left;
      this.positionXDifference = this.positionXDifference || 8;
      let positionX = positionXDifference - this.positionXDifference;
      (positionX <= 0) ? positionX = 0 : '';
      (positionX >= this.maximumWidth) ? positionX = this.maximumWidth : '';
      let clickPointBetweenPointers = (positionX > this.pointerLeftPosition) ? positionX - this.pointerLeftPosition : positionX;
      //console.log(this.pointerLeftPosition, this.pointerRightPosition, clickPointBetweenPointers, positionX);

      if (positionX < this.pointerLeftPosition || clickPointBetweenPointers < (Math.round(this.pointerRightPosition - this.pointerLeftPosition)) / 2) {
        if (positionX <= this.positionXDifference) {
          this.pointerLeftPosition = 0;
        } else {
          this.pointerLeftPosition = positionX;
        }
        this.pointerRightIndex = 0;
        this.pointerleftIndex = 1;
        let selectedTime = this.getTimeByPosition(positionX);
        this.hilightWidth = this.pointerRightPosition - this.pointerLeftPosition;
        this.leftToolTip = String(this.convertTimeRangeToDigitalClock(selectedTime));
      } else if (positionX > this.pointerRightPosition || clickPointBetweenPointers > (Math.round(this.pointerRightPosition - this.pointerLeftPosition)) / 2) {
        if (positionX >= this.maximumWidth) {
          this.pointerRightPosition = this.maximumWidth;
        } else {
          this.pointerRightPosition = positionX;
        }
        this.pointerleftIndex = 0;
        this.pointerRightIndex = 1;
        let selectedTime = this.getTimeByPosition(positionX);
        this.hilightWidth = this.pointerRightPosition - this.pointerLeftPosition;
        this.rightToolTip = String(this.convertTimeRangeToDigitalClock(selectedTime));
      } else {
        console.error(this.pointerLeftPosition, this.pointerRightPosition, clickPointBetweenPointers, positionX);
      }
    }

  }

  mouseUpOnClickBar() {

  }

  mouseDownOnLeftPointer(event: any) {
    //console.log(event);
    this.pointerRightIndex = 0;
    this.pointerleftIndex = 1;
    this.mouseClickedOnLeftPointer = true;
    this.findPositionXDifference(event, this.pointerLeft);
    return false;
  }

  mouseUpOnLeftPointer(event: any) {
    //console.log(event);
    //this.mouseClickedOnLeftPointer = false;
  }

  mouseDownOnRightPointer(event: any) {
    //console.log(event);
    this.pointerRightIndex = 1;
    this.pointerleftIndex = 0;
    this.mouseClickedOnRightPointer = true;
    this.findPositionXDifference(event, this.pointerRight);
    return false;
  }

  mouseUpOnRightPointer(event: any) {
    //console.log(event);
    //this.mouseClickedOnRightPointer = false;
  }

  convertTimeRangeToDigitalClock(value: any) {
    // return '00:00';
    return this.timeConvert(value);
  }

  timeConvert(num) {
    var decimalTimeString = num;
    var decimalTime = parseFloat(decimalTimeString);
    //console.log("parseFloat", decimalTime);
    decimalTime = decimalTime * 60 * 60;
    var hours: any = Math.floor((decimalTime / (60 * 60)));
    decimalTime = decimalTime - (hours * 60 * 60);
    var minutes: any = Math.floor((decimalTime / 60));
    decimalTime = decimalTime - (minutes * 60);
    var seconds: any = Math.round(decimalTime);
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    //console.log("hi there", "" + hours + ":" + minutes + ":" + seconds);
    //var digitalTimeString: string = hours + ":" + minutes + ":" + seconds;
    let digitalTimeString: string = this.setAmPm(hours, minutes);
    return digitalTimeString;
  }

  setAmPm(hours, minutes) {
    let sufix = '';
    if (Number(hours) >= 12) {
      sufix = 'PM';
      if (Number(hours) > 12) {
        hours = hours - 12;
      }
    } else {
      sufix = 'AM';
    }
    let digitalTimeString: string = hours + ":" + minutes + " " + sufix;
    return String(digitalTimeString);
  }

  getTimeByRange(range) {
    var ratio = (this.timeRange[1] - this.timeRange[0]) / 100;
    //console.log((range * ratio) + this.timeRange[0]);
    return (range * ratio) + this.timeRange[0];
  }

  getTimeByPosition(position) {
    let periodRange = this.timeRange[1] - this.timeRange[0];
    let totalPeriodsInMinutes = Math.round(position / (this.maximumWidth / (periodRange * (60 / this.periodInMinute)))) * this.periodInMinute;
    let totalPeriodsInHours = (this.timeRange[1] - periodRange) + (totalPeriodsInMinutes / 60);
    return totalPeriodsInHours;
  }

  getPositionByRange(range) {
    var ratio = this.maximumWidth / 100;
    return range * ratio;
  }

  getRangeByPosition(position) {
    //console.log(position);
    var ratio = 100 / this.maximumWidth;
    //console.log(position, Math.round(position * ratio), Math.abs(Math.round(position * ratio)));
    return Math.abs(Math.round(position * ratio));
  }

  findPositionXDifference(event: any, element: any) {
    var clientPosition = this.getClientCoordinatesFromEvent(event);
    var elementClientRect = element.nativeElement.getBoundingClientRect();
    var positionXDifference = clientPosition.clientX - elementClientRect.left;
    this.positionXDifference = positionXDifference;
    //console.log(elementClientRect.left, clientPosition.clientX, positionXDifference);
  }

  /**
   * Represents to retrive the x y coordinates from event
   * @param event 
   */
  getClientCoordinatesFromEvent(event: any): any {
    var clientX: number = null;
    var clientY: number = null;
    var clientIs: string = null;
    if (event && (event.clientX || event.clientX === 0) && (event.clientY || event.clientY === 0)) {
      clientX = event.clientX;
      clientY = event.clientY;
      clientIs = 'event';
    } else if (event && event.touches && event.touches[0] && event.touches[0].clientX && event.touches[0].clientY) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
      clientIs = 'event.touches[0]';
    } else if (event && event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0] && event.originalEvent.touches[0].clientX && event.originalEvent.touches[0].clientY) {
      clientX = event.originalEvent.touches[0].clientX;
      clientY = event.originalEvent.touches[0].clientY;
      clientIs = 'event.originalEvent.touches[0]';
    } else if (event && event.targetTouches && event.targetTouches[0] && event.targetTouches[0].clientX && event.targetTouches[0].clientY) {
      clientX = event.targetTouches[0].clientX;
      clientY = event.targetTouches[0].clientY;
      clientIs = 'event.targetTouches[0]';
    } else {
      console.error('client coordinates not able to retrive from event =', event);
    }
    return { clientX: clientX, clientY: clientY, clientIs: clientIs };
  }

}
