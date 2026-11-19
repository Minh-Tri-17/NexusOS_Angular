import { inject, Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  //#region //@ STATE

  private readonly modal = inject(NgbModal);

  //#endregion

  //#region //@ METHODS

  closeModal() {
    this.modal.dismissAll();
  }

  formatDateForInput(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toISOString().split('T')[0];
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //#endregion
}
