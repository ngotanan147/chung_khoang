import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { selectColor } from '../../ulti/common.ulti';

@Component({
  selector: 'app-my-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './my-table.component.html',
  styleUrl: './my-table.component.scss',
})
export class MyTableComponent {
  @ViewChild('dt2') dt2!: Table;
  @Input() title = '';
  @Input()
  products: any[] = [];

  selectedTimeOption = {
    label: 'Quarter',
    value: 'QUARTER',
  };
  selectedField = {
    label: 'Lợi nhuận sau thuế',
    value: 23003,
  };

  constructor() {}

  ngOnInit() {}

  selectColor(num: number) {
    return selectColor(num);
  }
}
