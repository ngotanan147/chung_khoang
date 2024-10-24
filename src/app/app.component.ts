import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientService } from './core/services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { map, of, switchMap } from 'rxjs';
import { MyTableComponent } from './core/components/my-table/my-table.component';
import { LoadingService } from './core/services/loading.serivce';
import { LoadingComponent } from './core/components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, MyTableComponent, LoadingComponent],
  providers: [HttpClientService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private _httpService = inject(HttpClientService);
  // Lợi nhuận sau thuế thu nhập doanh nghiệp: code = 23003
  codeUrl = 'https://mkw-socket-v2.vndirect.com.vn/mkwsocketv2/industrylead';
  data: any[] = [];

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
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
          console.log(codeAndGroupDics);
          return codeAndGroupDics;
        }),
        switchMap((res: any) => {
          return this._httpService.get(
            `https://api-finfo.vndirect.com.vn/v4/financial_statements?q=code:${Array.from(res.map((item: any) => item.code)).join(',')}~reportType:QUARTER~modelType:2,90,102,412~fiscalDate:2024-12-31,2024-09-30,2024-06-30,2024-03-31,2023-12-31,2023-09-30,2023-06-30,2023-03-31,2022-12-31~itemCode:23003&sort=fiscalDate&size=1000`,
          );
        }),
      )
      .subscribe({
        next: (res: any) => {
          console.log(this.transformData(res.data));
          this.data = this.transformData(res.data);
          this.data = this.data.map((item2) => {
            const matchedItem = codeAndGroupDics.find(
              (item1: any) => item1.code === item2.code,
            );
            return { ...item2, group: matchedItem?.group || 'Unknown' }; // Add group or 'Unknown' if not found
          });
          this.loadingService.hideLoading();
        },
        error: () => {
          this.loadingService.hideLoading();
        },
      });
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
    return Object.keys(groupedData)
      .map((code) => {
        const codeData = groupedData[code];

        // Ensure we have at least two records to calculate
        if (codeData.length >= 2) {
          // Take the first two records
          const [first, second] = codeData;
          const percent = (
            ((first.numericValue - second.numericValue) /
              Math.abs(parseFloat(first.numericValue))) *
            100
          ).toFixed(2);

          return {
            code: code,
            group: groupedData?.vietnameseName ?? null,
            value1:
              parseFloat((first.numericValue / 1000000000).toFixed(2)) || null, // First value
            value2:
              parseFloat((second.numericValue / 1000000000).toFixed(2)) || null, // Second value
            percent: parseFloat(percent),
          };
        }
        return null;
      })
      .filter(Boolean); // Filter out any null entries
  }
}
