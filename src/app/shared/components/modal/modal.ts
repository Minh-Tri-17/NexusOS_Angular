import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { BaseService } from '../../../core/services/base.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-modal',
  exportAs: 'appModal',
  imports: [TranslatePipe],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Modal {
  private readonly baseService = inject(BaseService);

  handleClose() {
    this.baseService.closeModal();
  }
}
