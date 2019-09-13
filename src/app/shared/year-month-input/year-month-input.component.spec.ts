import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YearMonthInputComponent } from './year-month-input.component';

describe('YearMonthInputComponent', () => {
  let component: YearMonthInputComponent;
  let fixture: ComponentFixture<YearMonthInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YearMonthInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearMonthInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
