import { Component, output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  imports: [],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  //#region //@ PROPS

  searchText = output<string>();
  clearFilters = output<void>();

  //#endregion

  //#region //@ METHODS

  handleSearch(value: string) {
    this.searchText.emit(value);
  }

  handleClearFilters() {
    this.clearFilters.emit();
  }

  //#endregion
}
