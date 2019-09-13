import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent implements OnInit {

  @Input()
  label: string;

  @Input()
  value: number = 1;

  @Input()
  min = 1;

  @Input()
  max = Infinity;

  @Output() getValue = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit() {
  }

  setValue(value) {

    if (value < this.min || value > this.max) {
      return;
    }

    this.value = value;
    this.getValue.emit(this.value);

  }

  increaseValue() {
    this.setValue(this.value + 1);
  }

  decreaseValue() {
    this.setValue(this.value - 1);
  }

}
