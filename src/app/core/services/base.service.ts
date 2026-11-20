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
    if (typeof date === 'string') {
      const isoDateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(date.trim());
      if (isoDateMatch) return isoDateMatch[1];
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //#endregion
}
