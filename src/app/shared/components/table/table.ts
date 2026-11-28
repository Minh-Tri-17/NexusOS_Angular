import { Component, input, ViewEncapsulation } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-table',
  imports: [TranslatePipe],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Table {
  readonly isLoading = input<boolean>(false);
  readonly minWidth = input<string>('1600px');
  readonly maxHeight = input<string>();
  readonly containerClass = input<string>('mb-3');
  readonly tableClass = input<string>('');
}
