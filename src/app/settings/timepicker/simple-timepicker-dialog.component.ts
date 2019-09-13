
import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'simple-timepicker-dialog',
    templateUrl: './simple-timepicker-dialog.component.html',
    styleUrls: ['./simple-timepicker-dialog.component.css'],
})
export class SimpleTimePickerDialog {

    time: any = {};

    constructor(
        @Inject(MAT_DIALOG_DATA) timeData,
        private dialogRef: MatDialogRef<SimpleTimePickerDialog>,
        cdRef: ChangeDetectorRef) {

        this.time = timeData;
    }

    revert() {
        this.dialogRef.close(-1);
    }

    submit() {
        this.dialogRef.close(this.time);
    }

    hour(){
        return `0${this.time.hour}`.slice(-2);
    }
    minute(){
        return `0${this.time.minute}`.slice(-2);
    }
    incHour(){
        var hour = this.time.hour + 1;
        if (hour > 23) hour = 0;
        this.time.hour = hour;
    }
    decHour(){
        var hour = this.time.hour - 1;
        if (hour < 0) hour = 23;
        this.time.hour = hour;
    }
    incMinute(){
        var minute = this.time.minute + 1;
        if (minute > 59) minute = 0;
        this.time.minute = minute;
    }
    decMinute(){
        var minute = this.time.minute - 1;
        if (minute < 0) minute = 59;
        this.time.minute = minute;
    }
}
