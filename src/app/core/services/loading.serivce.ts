import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  showLoading(): void {
    this.isLoadingSubject.next(true);
  }

  hideLoading(): void {
    this.isLoadingSubject.next(false);
  }
}
