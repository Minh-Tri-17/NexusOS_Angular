import { inject, Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  private readonly modal = inject(NgbModal);

  closeModal() {
    this.modal.dismissAll();
  }
}