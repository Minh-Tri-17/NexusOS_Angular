import { Component, inject, input } from '@angular/core';
import { BaseService } from '../../../core/services/base.service';

@Component({
  selector: 'app-modal',
  exportAs: 'appModal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  private readonly baseService = inject(BaseService);
  readonly modalId = input<string>();

  handleClose() {
    this.baseService.closeModal();
  }
}
