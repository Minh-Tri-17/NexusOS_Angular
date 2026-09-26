import { Component, model, output, signal } from '@angular/core';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toolbar',
  imports: [NgbCollapse],
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

  //#endregion

  //#region //@ METHODS

  handleSearch(value: string) {
    this.searchText.set(value);
  }

  handleClearFilters() {
    this.clearFilters.emit();
  }

  handleToggleShowDelete() {
    this.filterIsDelete.update((val) => !val);
  }

  //#endregion
}
