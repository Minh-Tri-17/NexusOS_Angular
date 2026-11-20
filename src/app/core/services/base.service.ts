import { ElementRef, inject, Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
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

  formatDateForInput(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') {
      const isoDateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(date.trim());
      if (isoDateMatch) return isoDateMatch[1];
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //#endregion

  //#region //@ FILE

  getSelectedFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    return input?.files?.[0] ?? null;
  }

  readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  resetFileInput(
    input: HTMLInputElement | ElementRef<HTMLInputElement> | null | undefined,
  ): void {
    if (!input) return;
    const element = input instanceof ElementRef ? input.nativeElement : input;
    element.value = '';
  }

  clearFileField(
    control: AbstractControl | null | undefined,
    input?: HTMLInputElement | ElementRef<HTMLInputElement> | null,
  ): void {
    control?.setValue(null);
    this.resetFileInput(input);
  }

  //#endregion
}
