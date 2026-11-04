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

  //#endregion
}
