import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  concatMap,
  delay,
  forkJoin,
  map,
  Observable,
  of,
  throwError,
  toArray,
} from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private apiUrl = 'https://api.example.com'; // Base URL of your API

  constructor(private http: HttpClient) {}

  // Delay function to return an observable that completes after the specified time
  private delayTime(ms: number): Observable<void | null> {
    return of(null).pipe(delay(ms));
  }

  // Method to fetch data for a single code
  getDataForCode(code: string): Observable<any> {
    const url = `https://api-finfo.vndirect.com.vn/v4/financial_statements?q=code:${code}~reportType:QUARTER~modelType:2,90,102,412~fiscalDate:2024-12-31,2024-09-30,2024-06-30,2024-03-31,2023-12-31,2023-09-30,2023-06-30,2023-03-31,2022-12-31~itemCode:23003&sort=fiscalDate&size=2`;
    return this.http
      .get<{ data: { code: string; numericValue: number }[] }>(url)
      .pipe(
        map((response) => {
          const values = response.data;
          return {
            code: code,
            value1: (values[0]?.numericValue / 1000000000).toFixed(2) || null, // First value
            value2: (values[1]?.numericValue / 1000000000).toFixed(2) || null, // Second value
            percent: (
              ((values[0]?.numericValue - values[1]?.numericValue) /
                values[0]?.numericValue) *
              100
            ).toFixed(2),
          };
        }),
      );
  }

  // Method to fetch data for all codes and merge the results
  getAllData(codes: string[], delayTimeInMs: number = 1000): Observable<any[]> {
    return of(codes).pipe(
      concatMap((code: any) =>
        this.getDataForCode(code).pipe(
          // Add delay before the next API call
          concatMap((data) =>
            this.delayTime(delayTimeInMs).pipe(map(() => data)),
          ),
        ),
      ),
      // Collect results
      toArray(),
    );
  }

  // GET request
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${endpoint}`).pipe(
      retry(2), // Retry the request up to 2 times in case of failure
      catchError(this.handleError), // Handle any errors
    );
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
