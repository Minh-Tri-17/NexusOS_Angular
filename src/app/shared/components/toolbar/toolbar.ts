import { Component, model, output, signal } from '@angular/core';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  imports: [NgbCollapse, TranslatePipe],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  //#region //@ PROPS

  searchText = model<string>('');
  filterIsDelete = model<boolean>(false);
  clearFilters = output<void>();

  //#endregion

  //#region //@ STATE

  readonly filterCollapsed = signal(true);
  readonly currentInput = signal('');

  //#endregion

  //#region //@ METHODS

  handleSearch(value: string) {
    this.currentInput.set(value);
    this.searchText.set(value);
  }

  handleInputChange(value: string) {
    this.currentInput.set(value);
    if (!value) this.searchText.set('');
  }

  handleClear(input: HTMLInputElement) {
    input.value = '';
    this.currentInput.set('');
    this.searchText.set('');
  }

  handleClearFilters() {
    this.currentInput.set('');
    this.clearFilters.emit();
  }

  handleToggleShowDelete() {
    this.filterIsDelete.update((val) => !val);
  }

  //#endregion
}
