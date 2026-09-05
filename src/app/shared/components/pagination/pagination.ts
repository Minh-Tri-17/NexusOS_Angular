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

  //* computed() dùng để tính toán giá trị dựa trên state khác
  pages = computed(() => {
    const list = [];

    for (let i = 1; i <= this.pageCount(); i++) {
      list.push(i);
    }

    return list;
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
