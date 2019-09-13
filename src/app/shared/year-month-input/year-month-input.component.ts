import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

@Component({
  selector: 'app-year-month-input',
  templateUrl: './year-month-input.component.html',
  styleUrls: ['./year-month-input.component.scss']
})
export class YearMonthInputComponent implements OnInit {

  @Input()
  label: string;

  @Input()
  year: number = new Date().getFullYear();

  @Input()
  month: number = 0;

  @Output() getValue = new EventEmitter<{
    year: number,
    month: number
  }>();

  constructor() {
  }

  ngOnInit() {
  }

  getMonthName(value) {
    return months[value];
  }

  increaseValue() {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }

    this.getValue.emit({
      year: this.year,
      month: this.month
    });
  }

  decreaseValue() {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }

    this.getValue.emit({
      year: this.year,
      month: this.month
    });
  }
}

