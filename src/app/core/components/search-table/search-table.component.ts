import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { selectColor } from '../../ulti/common.ulti';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-search-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    ButtonDirective,
  ],
  templateUrl: './search-table.component.html',
  styleUrl: './search-table.component.scss',
})
export class SearchTableComponent {
  searchKey: string = '';

  @ViewChild('dt2') dt2!: Table;
  @Input() products: any[] = [];

  selectColor(num: number) {
    return selectColor(num);
  }

  // Method to handle filtering
  filterTable(event: Event): void {
    if (!this.dt2) return;
    const input = event.target as HTMLInputElement; // Use type assertion here
    if (!input.value) {
      this.dt2.filterGlobal('**!*!*', 'contains'); //Return no data
      return;
    }
    this.dt2.filterGlobal(input.value.trim(), 'contains');
  }

  onPaste(event: ClipboardEvent): void {
    if (!event.clipboardData) return;
    const pastedValue = event.clipboardData.getData('text');
    this.dt2.filterGlobal(pastedValue.trim(), 'contains');
  }
}
