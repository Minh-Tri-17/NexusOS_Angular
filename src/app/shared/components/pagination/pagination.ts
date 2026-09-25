import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  //#region //@ PROPS

  pageIndex = model<number>(1);
  pageSize = model<number>(20);
  totalRecord = input<number>(0);
  recordRange = input<string>();
  pageCount = input<number>(0);

  //#endregion

  //#region //@ STATE

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly pages = computed(() => {
    const list = [];

    for (let i = 1; i <= this.pageCount(); i++) {
      list.push(i);
    }

    return list;
  });
  readonly visiblePages = computed<(number | string)[]>(() => {
    const total = this.pageCount();
    const current = this.pageIndex();
    const delta = 1;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    const pages: (number | string)[] = [1];
    if (current - delta > 2) {
      pages.push('...');
    }

    pages.push(...range);

    if (current + delta < total - 1) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
  });

  //#endregion

  //#region //@ METHODS

  handlePageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
  }

  handlePageIndexChange(index: string | number) {
    this.pageIndex.set(Number(index));
  }

  //#endregion
}
