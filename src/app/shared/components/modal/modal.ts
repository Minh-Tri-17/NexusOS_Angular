import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseService } from '../../../core/services/base.service';

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
