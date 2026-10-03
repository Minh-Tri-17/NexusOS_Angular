import { Component, inject, input } from '@angular/core';
import { BaseService } from '../../../core/services/base.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-modal',
  exportAs: 'appModal',
  imports: [TranslatePipe],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  private readonly baseService = inject(BaseService);

  handleClose() {
    this.baseService.closeModal();
  }
}
