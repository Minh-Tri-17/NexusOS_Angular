import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { Result } from '../../../core/models/common.model';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-import',
  imports: [Modal],
  templateUrl: './import.html',
  styleUrl: './import.scss',
})
export class Import {
  readonly acceptTypes = '.xlsx,.xls,.csv';
  readonly maxSizeMB = 10;

  //#region //@ PROPS

  importFn = input.required<(file: File) => Promise<Result<boolean>>>();
  importSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  isDragOver = signal<boolean>(false);
  isImporting = signal<boolean>(false);
  selectedFile = signal<File | null>(null);
  errorMessage = signal<string>('');
  showProgress = signal<boolean>(false);
  progressStatus = signal<string>('');
  progressPercentage = signal<number>(0);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('importFileInput');

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

  private closeModal() {
    const modalEl = document.getElementById('importModal');
    if (modalEl) {
      const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bootstrapModal?.hide();
    }
  }

  private resetFileInput() {
    //* nativeElement lắng nghe sự thay đổi giá trị của form.
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
  }

  //#endregion

  //#region //@ METHODS

  handleTriggerFileInput() {
    if (this.isImporting()) return;

    //* nativeElement lắng nghe sự thay đổi giá trị của form.
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
      const file = event.dataTransfer.files[0];
      this.validateAndSetFile(file);
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
      const result = await this.importFn()(file);
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
    } catch (error) {
      this.animateProgress(0, 'Import failed. Please try again.');
      await this.delay(3000);
    } finally {
      this.isImporting.set(false);
      this.showProgress.set(false);
      this.closeModal();
    }
  }

  //#endregion
}
