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

const TimeOptions = [
  {
    label: 'Year',
    value: 'ANNUAL',
  },
  {
    label: 'Quarter',
    value: 'QUARTER',
  },
];

const FieldOptions = [
  {
    label: 'Lợi nhuận sau thuế',
    value: 23003,
  },
  {
    label: 'Thu nhập lãi thuần',
    value: 421900,
  },
  {
    label: 'Tổng doanh thu',
    value: 21000,
  },
];

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
  @Output() timeSelectEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() fieldSelectEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  products: any[] = [];
  timeOptions = TimeOptions;
  fieldOptions = FieldOptions;
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

  // Method to handle filtering
  filterTable(event: Event): void {
    const input = event.target as HTMLInputElement; // Use type assertion here
    this.dt2.filterGlobal(input.value, 'contains');
  }

  onTimeChange(): void {
    this.timeSelectEmitter.emit(this.selectedTimeOption);
  }

  onFieldChange(): void {
    this.fieldSelectEmitter.emit(this.selectedField);
  }
}
