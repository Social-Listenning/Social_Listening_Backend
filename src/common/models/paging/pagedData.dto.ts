import { Page } from './page.dto';

export class PagedData<T> {
  constructor(page: Page) {
    this.Page = page;
  }

  public Data: T[];
  public Page: Page;
}
