import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.component.html',
})

export class ItemEditComponent implements OnInit {

  menu_item: any = {
    name: 'Test Product',
    price: 120,
    description: 'Product description.',
    toppings: [
      {
        name: 'toppings1',
        price: 1
      },
      {
        name: 'toppings1',
        price: 1
      },
      {
        name: 'toppings1',
        price: 1
      },
    ]
  };

  constructor() { }

  ngOnInit(): void { }
}
