// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, AfterViewInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService, AssetService, AppService, BeachService } from '../services/index';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

declare const $: any;
let employeeComponent = null;

@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html'
})

export class EmployeesComponent implements OnInit, AfterViewInit {

    public tableHeader: any = ['EMPLOYEE.NAME', 'EMPLOYEE.POSITION', 'EMPLOYEE.COLOR', 'EMPLOYEE.PHONE', 'EMPLOYEE.UNLOCK', 'EMPLOYEE.VERIFIED', 'EMPLOYEE.DATE', 'EMPLOYEE.ACTIONS'];

    employees: any = [];
    colors: any = [];
    types: any = [];
    loading = false;

    constructor(
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private assetService: AssetService,
        private beachService: BeachService,
        private userService: UserService,
        private translate: TranslateService,
        private appService: AppService,
        private router: Router,
    ) {
        this.translate.use(this.appService.getLang());
        employeeComponent = this;
    }

    openDialog(employee): void {
        let dialogRef = this.dialog.open(EmployeeAddDialog, {
            width: "100%",
            data: {
                employee,
                types: this.types,
                colors: this.colors,
            }
        });
        dialogRef.afterClosed().subscribe(employees => {
            if (employees) {
                this.employees = employees;
                this.refreshColors();
            }
        });
    }

    ngOnInit() {
        this.loading = true;
        this.beachService.checkLogic(this.beachService.CHECK.EMPLOYEE)
            .then(() => {
                return this.userService.getEmployees();
            })
            .then((employees) => {
                this.employees = employees;
                return this.assetService.getRanks();
            })
            .then(ranks => {
                this.types = [];
                ranks.forEach(item => {
                    if (item.id === 2 || item.id === 5) this.types.push(item);
                })
                this.loading = false;
                this.refreshColors();
            })
            .catch(error => {
                if (error.type === 'auth') return;
                if (error.logicError) {
                    error.logicError.subscribe(result => {
                        swal({
                            type: 'error',
                            title: '',
                            confirmButtonClass: 'btn btn-info',
                            text: result,
                            buttonsStyling: false,
                        })
                            .then(() => {
                                this.router.navigateByUrl(error.url);
                            }).catch(() => {
                                this.router.navigateByUrl(error.url);
                            });
                    })
                } else {
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                    this.loading = false;
                }
            });
    }
    refreshColors() {
        this.assetService.getColors()
            .then(colors => {
                this.colors = [];
                colors.forEach(color => {
                    let exists = false;
                    this.employees.forEach(employee => {
                        if (employee.color === color.hex) exists = true;
                    })
                    if (!exists) this.colors.push(color);
                })
            })
    }

    ngAfterViewInit() {
        $('#datatables').DataTable({
            searching: false,
            ordering: false,
            lengthChange: false,
            pagingType: 'full_numbers',
            responsive: true,
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
            }
        });

        const table = $('#datatables').DataTable();

        // Edit record
        table.on('click', '.edit', function () {
            const id = $(this).attr('employee-id');
            let employee = {};
            employeeComponent.employees.forEach(item => {
                if (id === item.id) employee = item
            })
            employeeComponent.openDialog(employee);
        });

        // Delete a record
        table.on('click', '.remove', function (e: any) {
            if (confirm("Do you want to remove the waiter? Are you sure?")){
                const id = $(this).attr('employee-id');
                employeeComponent.userService.removeEmployee(id)
                    .then(success => {
                        employeeComponent.employees.forEach((item, index) => {
                            if (item.id === id) {
                                employeeComponent.employees.splice(index, 1);
                            }
                        })
                    })
                    .catch(error => {
                        if (error.type === 'auth') return;
                        swal({
                            type: 'error',
                            title: '',
                            confirmButtonClass: 'btn btn-info',
                            text: error.message,
                            buttonsStyling: false,
                        }).catch(swal.noop);
                    })
            }
        });
    }
}

@Component({
    selector: 'employee-add-dialog',
    templateUrl: 'employee-add-dialog.html',
})
export class EmployeeAddDialog {

    constructor(
        private beachService: BeachService,
        private userService: UserService,
        public dialogRef: MatDialogRef<EmployeeAddDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    save(): void {
        const employee = this.data.employee;
        if (!employee.id) {
            this.beachService.getBeach()
                .then(beach => {
                    return this.userService.addEmployee({ beach_id: beach.id, ...employee });
                })
                .then(employee => {
                    return this.userService.getEmployees()
                })
                .then(employees => {
                    this.dialogRef.close(employees);
                })
                .catch(error => {
                    if (error.type === 'auth') return;
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                })
        } else {
            const { type_id, name, id, phone, unlock_code, color } = JSON.parse(JSON.stringify(employee));
            this.userService.updateEmployee({ type_id, name, id, phone, unlock_code, color })
                .then(() => {
                    return this.userService.getEmployees()
                })
                .then(employees => {
                    this.dialogRef.close(employees);
                    this.dialogRef.close(employees);
                })
                .catch(error => {
                    if (error.type === 'auth') return;
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                })
        }
    }
}
