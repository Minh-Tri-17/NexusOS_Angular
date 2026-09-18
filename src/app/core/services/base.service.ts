import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  closeModal(modalId: string) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bootstrapModal?.hide();
    }
  }
}
