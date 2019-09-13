import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as Chartist from 'chartist';
import { StatisticsService } from 'app/services/statistics.service';


@Component({
  selector: 'app-compare-cmp',
  templateUrl: 'compare.component.html'
})
export class CompareComponent {
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());

  // day chart stat
  dayChart = {
    leftSide: {
      total: 0,
      online: 0,
      offline: 0
    },
    rightSide: {
      total: 0,
      online: 0,
      offline: 0
    }
  }

  // weekly chart stat
  weekChart = {
    leftSide: {
      total: 0,
      online: 0,
      offline: 0
    },
    rightSide: {
      total: 0,
      online: 0,
      offline: 0
    }
  }

  // monthly chart stat
  monthChart = {
    leftSide: {
      total: 0,
      online: 0,
      offline: 0
    },
    rightSide: {
      total: 0,
      online: 0,
      offline: 0
    }
  }

  // yearly chart stat
  yearChart = {
    leftSide: {
      total: 0,
      online: 0,
      offline: 0
    },
    rightSide: {
      total: 0,
      online: 0,
      offline: 0
    }
  }

  dailyLeftSideValue: Date;
  dailyRightSideValue: Date;

  weeklyLeftSideValue: Date;
  weeklyRightSideValue: Date;

  yearlyLeftSideValue;
  yearlyRightSideValue;

  currentMonth;

  lastMonth = {
    year: null,
    month: null
  };

  constructor(private statService: StatisticsService) {
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    this.dailyLeftSideValue = yesterday;
    this.dailyRightSideValue = today;

    this.weeklyLeftSideValue = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.weeklyRightSideValue = today;

    this.yearlyRightSideValue = today.getFullYear();
    this.yearlyLeftSideValue = today.getFullYear() - 1;

    this.currentMonth = today.getMonth();

    if (this.currentMonth === 0) {
      this.lastMonth = {
        year: today.getFullYear() - 1,
        month: 11
      }
    } else {
      this.lastMonth = {
        year: today.getFullYear(),
        month: today.getMonth() - 1
      }
    }
  }

  async onDailyLeftSideChange() {
    const d = new Date(this.dailyLeftSideValue);
    const res = await this.statService.getDailyStat(d.getFullYear(), d.getMonth(), d.getDate());
    this.dayChart.leftSide = res;
    this.reloadChartGroup(0);
  }

  async onDailyRightSideChange() {
    const d = new Date(this.dailyRightSideValue);
    const res = await this.statService.getDailyStat(d.getFullYear(), d.getMonth(), d.getDate());
    this.dayChart.rightSide = res;
    this.reloadChartGroup(0);
  }

  async onWeeklyLeftSideChange() {
    const d = new Date(this.weeklyLeftSideValue);
    const res = await this.statService.getWeeklyStat(d.getFullYear(), d.getMonth(), d.getDate());
    this.weekChart.leftSide = res;
    this.reloadChartGroup(1);
  }

  async onWeeklyRightSideChange() {
    const d = new Date(this.weeklyRightSideValue);
    const res = await this.statService.getWeeklyStat(d.getFullYear(), d.getMonth(), d.getDate());
    this.weekChart.rightSide = res;
    this.reloadChartGroup(1);
  }

  async onMonthlyLeftSideChange({ year, month }) {
    const res = await this.statService.getMonthlyStat(year, month + 1);
    this.monthChart.leftSide = res;
    this.reloadChartGroup(2);
  }

  async onMonthlyRightSideChange({ year, month }) {
    const res = await this.statService.getMonthlyStat(year, month + 1);
    this.monthChart.rightSide = res;
    this.reloadChartGroup(2);
  }

  async onYearlyLeftSideChange(year: number) {
    const res = await this.statService.getYearlyStat(year);
    this.yearChart.leftSide = res;
    this.reloadChartGroup(3);
  }

  async onYearlyRightSideChange(year: number) {
    const res = await this.statService.getYearlyStat(year);
    this.yearChart.rightSide = res;
    this.reloadChartGroup(3);
  }

  startAnimationForBarChart(chart: any) {
    let seq2: number, delays2: number, durations2: number;
    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data: any) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  }

  ngOnInit() {
    this.fetchData();

    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();

    this.statService.getWeeklyStat(year, month, date);
    this.statService.getMonthlyStat(year, month);
    this.statService.getYearlyStat(year);
  }

  private async fetchData() {
    const stat: any = await this.statService.getSummeryStatForToday();

    this.dayChart = {
      leftSide: stat.dailStat.yesterdayStat,
      rightSide: stat.dailStat.todayStat
    };

    this.weekChart = {
      leftSide: stat.weeklyStat.weekBeforeLastWeek,
      rightSide: stat.weeklyStat.lastWeek
    };

    this.monthChart = {
      leftSide: stat.monthlyStat.lastMonth,
      rightSide: stat.monthlyStat.thisMonth
    };

    this.yearChart = {
      leftSide: stat.yearlyStat.lastYear,
      rightSide: stat.yearlyStat.thisYear
    };

    this.loadChart();
  }

  private getChartData() {
    const dataMultipleBarChart1 = {
      labels: [''],
      series: [
        [this.dayChart.leftSide.online],
        [this.dayChart.leftSide.offline]
      ]
    };
    const dataMultipleBarChart2 = {
      labels: [''],
      series: [
        [this.dayChart.rightSide.online],
        [this.dayChart.rightSide.offline]
      ]
    };
    const dataMultipleBarChart3 = {
      labels: [''],
      series: [
        [this.weekChart.leftSide.online],
        [this.weekChart.leftSide.offline]
      ]
    };
    const dataMultipleBarChart4 = {
      labels: [''],
      series: [
        [this.weekChart.rightSide.online],
        [this.weekChart.rightSide.offline]
      ]
    };
    const dataMultipleBarChart5 = {
      labels: [''],
      series: [
        [this.monthChart.leftSide.online],
        [this.monthChart.leftSide.offline]
      ]
    };
    const dataMultipleBarChart6 = {
      labels: [''],
      series: [
        [this.monthChart.rightSide.online],
        [this.monthChart.rightSide.offline]
      ]
    };
    const dataMultipleBarChart7 = {
      labels: [''],
      series: [
        [this.yearChart.leftSide.online],
        [this.yearChart.leftSide.offline]
      ]
    };
    const dataMultipleBarChart8 = {
      labels: [''],
      series: [
        [this.yearChart.rightSide.online],
        [this.yearChart.rightSide.offline]
      ]
    };

    return [
      [
        dataMultipleBarChart1,
        dataMultipleBarChart2
      ],
      [
        dataMultipleBarChart3,
        dataMultipleBarChart4
      ],
      [
        dataMultipleBarChart5,
        dataMultipleBarChart6
      ],
      [
        dataMultipleBarChart7,
        dataMultipleBarChart8
      ]
    ];
  }

  private loadChart() {
    const dataMultipleBarChart = this.getChartData();

    let i = 0;

    for (let chartGroup of dataMultipleBarChart) {
      let max = 0;

      for (let item of chartGroup) {
        for (let num of item.series) {
          if (num[0] > max) {
            max = num[0];
          }
        }
      }

      for (let item of chartGroup) {

        const optionsMultipleBarChart = {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
          },
          high: max ? max : null
        };

        const responsiveOptionsMultipleBarChart: any = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value: any) {
                return value[0];
              },
            },
            high: max ? max : null
          }]
        ];

        const MultipleBarChart = new Chartist.Bar(
          '#MultipleBarChart' + (i + 1),
          item,
          optionsMultipleBarChart,
          responsiveOptionsMultipleBarChart
        );

        // start animation for the Emails Subscription Chart
        this.startAnimationForBarChart(MultipleBarChart);

        i++;
      }
    }
  }

  private reloadChartGroup(index) {
    const dataMultipleBarChart = this.getChartData();
    let i = 0;
    let max = 0;
    let chartGroup = dataMultipleBarChart[index];

    for (let item of chartGroup) {
      for (let num of item.series) {
        if (num[0] > max) {
          max = num[0];
        }
      }
    }

    for (let item of chartGroup) {

      const optionsMultipleBarChart = {
        seriesBarDistance: 10,
        axisX: {
          showGrid: false,
        },
        high: max ? max : null
      };

      const responsiveOptionsMultipleBarChart: any = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function (value: any) {
              return value[0];
            },
          },
          high: max ? max : null
        }]
      ];

      const MultipleBarChart = new Chartist.Bar(
        '#MultipleBarChart' + (index * 2 + i + 1),
        item,
        optionsMultipleBarChart,
        responsiveOptionsMultipleBarChart
      );

      // start animation for the Emails Subscription Chart
      this.startAnimationForBarChart(MultipleBarChart);

      i++;
    }
  }
}

