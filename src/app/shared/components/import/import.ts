import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { Result } from '../../../core/models/common.model';
import { BaseService } from '../../../core/services/base.service';
import { IMPORT_MODAL_CONTEXT } from '../modal/modal-context';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-import',
  imports: [Modal],
  templateUrl: './import.html',
  styleUrl: './import.scss',
})
export class Import {
  private readonly baseService = inject(BaseService);

  //* NgbModal v21 không còn componentProps -> dữ liệu được cấp qua Injector khi open().
  private readonly ctx = inject(IMPORT_MODAL_CONTEXT, { optional: true });

  readonly acceptTypes = '.xlsx,.xls,.csv';
  readonly maxSizeMB = 10;

  //#region //@ PROPS

  readonly importFn = input<(file: File) => Promise<Result<boolean>>>();
  readonly importSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isDragOver = signal(false);
  readonly isImporting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly errorMessage = signal('');
  readonly showProgress = signal(false);
  readonly progressStatus = signal('');
  readonly progressPercentage = signal(0);

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('importFileInput');

  //#endregion

  //#region //@ HELPERS

  private validateAndSetFile(file: File) {
    this.errorMessage.set('');

    const acceptTypes = this.acceptTypes;
    if (acceptTypes) {
      const allowedExtensions = acceptTypes.split(',').map((ext) => ext.trim().toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        this.errorMessage.set(`Invalid file type. Accepted: ${acceptTypes}`);
        return;
      }
    }

    const maxBytes = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage.set(`File size exceeds limit of ${this.maxSizeMB}MB`);
      return;
    }

    this.selectedFile.set(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private animateProgress(target: number, status: string) {
    this.progressPercentage.set(target);
    this.progressStatus.set(status);
  }

  private resetFileInput() {
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
  }

  //#endregion

  //#region //@ METHODS

  handleTriggerFileInput() {
    if (this.isImporting()) return;
    this.fileInput()?.nativeElement.click();
  }

  handleDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isImporting()) this.isDragOver.set(true);
  }

  handleDragLeave() {
    this.isDragOver.set(false);
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (this.isImporting()) return;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.validateAndSetFile(file);
  }

  handleRemoveFile() {
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.resetFileInput();
  }

  async handleConfirmImport() {
    const file = this.selectedFile();
    if (!file) return;

    this.isImporting.set(true);
    this.showProgress.set(true);
    this.animateProgress(0, 'Preparing import...');

    try {
      this.animateProgress(10, 'Reading file...');
      await this.delay(300);
      this.animateProgress(30, 'Uploading data...');
      await this.delay(200);
      const result = await (this.ctx?.importFn ?? this.importFn()!)(file);
      this.animateProgress(80, 'Processing file...');
      await this.delay(400);

      if (!result.isSuccess) {
        this.animateProgress(0, 'Import failed. Please try again.');
        await this.delay(3000);
      } else {
        this.animateProgress(100, 'Import completed!');
        await this.delay(500);
        this.importSuccess.emit();
      }
    } catch {
      this.animateProgress(0, 'Import failed. Please try again.');
      await this.delay(3000);
    } finally {
      this.isImporting.set(false);
      this.showProgress.set(false);
      this.selectedFile.set(null);
      this.baseService.closeModal();
    }
  }

  //#endregion
}
