import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientService } from './core/services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { map, switchMap } from 'rxjs';
import { MyTableComponent } from './core/components/my-table/my-table.component';
import { LoadingService } from './core/services/loading.serivce';
import { LoadingComponent } from './core/components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { SearchTableComponent } from './core/components/search-table/search-table.component';
import { group } from '@angular/animations';

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
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    MyTableComponent,
    LoadingComponent,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    DropdownModule,
    FormsModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    SearchTableComponent,
  ],
  providers: [HttpClientService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private _httpService = inject(HttpClientService);
  @ViewChild('dt2') dt2!: Table;
  codeUrl = 'https://mkw-socket-v2.vndirect.com.vn/mkwsocketv2/industrylead';
  data: any[] = [];
  dataFiltered: any[] = [];
  notGroupedData: any[] = [];
  selectedTimeOption = {
    label: 'Quarter',
    value: 'QUARTER',
  };
  selectedField = {
    label: 'Lợi nhuận sau thuế',
    value: 23003,
  };
  selectedGroup = {
    label: 'All',
    value: 'All',
  };
  timeOptions = TimeOptions;
  fieldOptions = FieldOptions;
  groupOptions: any[] = [];

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    let codeAndGroupDics: any[] = [];
    this.loadingService.showLoading();
    this._httpService
      .get(this.codeUrl)
      .pipe(
        map((response: any) => {
          codeAndGroupDics = response.data.flatMap((item: any) =>
            item.codeList.map((subItem: any) => {
              return {
                code: subItem.code,
                group: item.vietnameseName,
              };
            }),
          );
          return codeAndGroupDics;
        }),
        switchMap((res: any) => {
          return this._httpService.get(
            `https://api-finfo.vndirect.com.vn/v4/financial_statements?q=code:${Array.from(res.map((item: any) => item.code)).join(',')}~reportType:${this.selectedTimeOption.value}~modelType:2,90,102,412~fiscalDate:2024-12-31,2024-09-30,2024-06-30,2024-03-31,2023-12-31,2023-09-30,2023-06-30,2023-03-31,2022-12-31~itemCode:${this.selectedField.value}&sort=fiscalDate&size=1000`,
          );
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.data = this.transformData(res.data);
          this.data = this.data.map((item2) => {
            const matchedItem = codeAndGroupDics.find(
              (item1: any) => item1.code === item2.code,
            );
            return { ...item2, group: matchedItem?.group || 'Unknown' };
          });
          this.notGroupedData = this.data;
          this.data = this.groupByKeyAndSort(this.data, 'group');
          this.getGroupList(this.data);
          this.getDataByGroup();
          console.log(this.data);
          console.log(this.groupOptions);
          this.loadingService.hideLoading();
        },
        error: () => {
          this.loadingService.hideLoading();
        },
      });
  }

  onTimeSelectChange() {
    this.getData();
  }

  onFieldSelectChange() {
    this.getData();
  }

  getDataByGroup() {
    if (this.selectedGroup.value === 'All') {
      this.dataFiltered = this.data;
    }
    const groupedData = this.data.find(
      (item: any) => item[0]?.group === this.selectedGroup.value,
    );
    if (groupedData) {
      this.dataFiltered = [groupedData];
    }
  }

  transformData(data: any) {
    // Group the data by code
    const groupedData = data.reduce((acc: any, curr: any) => {
      const { code } = curr;
      if (!acc[code]) {
        acc[code] = [];
      }
      acc[code].push(curr);
      return acc;
    }, {});

    // Perform the transformation
    // Filter out any null entries
    return Object.keys(groupedData)
      .map((code) => {
        if (code === 'HNG') {
          //
          console.log();
        }
        const codeData = groupedData[code];

        // Ensure we have at least two records to calculate
        if (codeData.length >= 2) {
          // Take the first two records
          const [first, second] = codeData;
          const value1 = parseFloat(
            (first.numericValue / 1000000000).toFixed(2),
          );
          const value2 = parseFloat(
            (second.numericValue / 1000000000).toFixed(2),
          );
          const percent = parseFloat(
            (((value1 - value2) / Math.abs(value2)) * 100).toFixed(2),
          );
          // (first.numericValue - second.numericValue)
          return {
            code: code,
            group: groupedData?.vietnameseName ?? null,
            value1: value1 || null, // First value
            value2: value2 || null, // Second value
            percent: percent,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  groupByKeyAndSort(array: any, key: any) {
    // Group by the key first
    const groupedArray = Object.values(
      array.reduce((acc: any, curr: any) => {
        if (!acc[curr[key]]) {
          acc[curr[key]] = [];
        }
        acc[curr[key]].push(curr);
        return acc;
      }, {}),
    );

    // Sort the grouped array by the length of each subarray
    return groupedArray.sort((a: any, b: any) => b.length - a.length);
  }

  // Method to handle filtering
  filterTable(event: Event): void {
    const input = event.target as HTMLInputElement; // Use type assertion here
    this.dt2.filterGlobal(input.value, 'contains');
  }

  getGroupList(data: any[]) {
    this.groupOptions = [];
    this.groupOptions.push({
      label: 'All',
      value: 'All',
    });
    data.forEach((item: any) => {
      if (item[0]) {
        this.groupOptions.push({
          label: item[0].group,
          value: item[0].group,
        });
      }
    });
  }
}
