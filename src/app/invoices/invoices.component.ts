// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../services';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

declare const $: any;

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html'
})

export class InvoicesComponent implements OnInit, AfterViewInit {
  public dataTable: DataTable;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
  ) {
    this.translate.use(this.appService.getLang());
  }
  ngOnInit() {
    this.dataTable = {

      headerRow: ['Invoice no', 'Period', 'Due date', 'Paid', 'Total'],
      footerRow: ['Invoice no', 'From', 'To', 'Due date', 'Paid', 'Total'],

      dataRows: [
        ['8133216832', '2018/07/01', '2018/07/15', '2018/07/25', '0', '82'],
        ['2333216832', '2018/06/16', '2018/06/30', '2018/07/10', '1', '110'],
        ['333216832', '2018/06/01', '2018/06/15', '2018/06/25', '1', '112']
      ]
    };
  }

  initDatatable() {
    if ($) {
      $('#datatables').DataTable({
        searching: false,
        ordering: false,
        lengthChange: false,
        'pagingType': 'full_numbers',
        /* 'lengthMenu': [[10, 25, 50, -1], [10, 25, 50, 'All']], */
        responsive: true,
        language: {
          search: '_INPUT_',
          searchPlaceholder: 'Search records',
        }

      });

      const table = $('#datatables').DataTable();
    } else {
      setTimeout(this.initDatatable.bind(this), 300);
    }
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
}
