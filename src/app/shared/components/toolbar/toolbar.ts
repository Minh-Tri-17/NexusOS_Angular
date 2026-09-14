import { Component, model, output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  imports: [],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  //#region //@ PROPS

  searchText = model<string>('');
  filterIsDelete = model<boolean>(false);
  clearFilters = output<void>();

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
