import { inject, Injectable, Injector } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dialog, DIALOG_OPTIONS, DialogOptions } from './dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);

  confirm(options?: DialogOptions): Promise<boolean> {
    const modalRef = this.modal.open(Dialog, {
      centered: true,
      windowClass: 'custom-modal',
      modalDialogClass: 'modal-confirm-dialog',
      injector: Injector.create({
        parent: this.injector,
        providers: [
          {
            provide: DIALOG_OPTIONS,
            useValue: options ?? {},
          },
        ],
      }),
    });

    return modalRef.result.then(
      (result) => result === true,
      () => false,
    );
  }
}
