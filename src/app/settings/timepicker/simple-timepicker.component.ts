import { Component, OnInit, ElementRef, Inject, Output, EventEmitter, Input } from '@angular/core';
import { DateAdapter, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatFormFieldControl } from '@angular/material';
import { FormControl } from '@angular/forms';
import { SimpleTimePickerDialog } from './simple-timepicker-dialog.component';

declare const require: any;

declare const $: any;

@Component({
    selector: 'simple-timepicker',
    templateUrl: 'simple-timepicker.component.html',
})

export class SimpleTimePicker {

    constructor(private dialog: MatDialog) { }

    @Output()
    setTime: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    public time: any;

    showPicker($event) {
        var target = event.target || event.srcElement || event.currentTarget;

        const {left, top} = $(target).offset();
        const scrol_position = $(window).scrollTop();
        //var position = $("#" + value).position();
        let dialogRef = this.dialog.open(SimpleTimePickerDialog, {
            position:{ top: (top - scrol_position + 40) + "px", left: (left + 10) + "px"},
            data: {
                hour: this.time.hour,
                minute: this.time.minute,
            },
            backdropClass: 'transparent'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === undefined) {
                return;
            } else if (result !== -1) {
                this.time.hour = result.hour;
                this.time.minute = result.minute;
                this.setTime.emit(this.time);
            }
        });

        return false;
    }
}
