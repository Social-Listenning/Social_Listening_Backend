import { FilterMapping } from 'src/common/models/paging/filterMapping.dto';
import { Page } from 'src/common/models/paging/page.dto';

type NestedObject = Record<string, unknown> | object;

export class AdvancedFilteringService {
  createFilter(page: Page) {
    const where = { AND: [] };
    const orderBy = [];

    page.orders.forEach((_sort) => {
      orderBy.push({ [_sort.props]: _sort.sortDir });
    });

    page.filter.forEach((_filter) => {
      const obj = this.buildColumnFilter(_filter);
      where.AND.push(obj);
    });

    return { ...page, filter: where, orders: orderBy };
  }

  private buildColumnFilter(filter: FilterMapping) {
    const props = filter.props;
    const queryString = this.getQuery(filter.filterOperator, filter.value);
    return this.buildQuery(props, queryString);
  }

  private buildQuery(props: string, obj: any) {
    const propsArray = props.split('.');
    const reverseArray = propsArray.reverse();

    let nestedObject: NestedObject = obj;

    for (const prop of reverseArray) {
      nestedObject = { [prop]: nestedObject };
    }

    return nestedObject;
  }

  private getQuery(filterOperator, filterValue) {
    switch (filterOperator) {
      case 'Contains':
        return { contains: filterValue };
      case 'Does Not Contains':
        return { not: { contains: filterValue } };
      case 'Is Empty':
        return { isEmpty: true };
      case 'Is Not Empty':
        return { isEmpty: false };
      case 'Start With':
        return { startWith: filterValue };
      case 'End With':
        return { endWith: filterValue };
      case 'Is Greater Than Or Equal To':
        return { gte: parseInt(filterValue) };
      case 'Is Greater Than':
        return { gt: parseInt(filterValue) };
      case 'Is Less Than Or Equal To':
        return { lte: parseInt(filterValue) };
      case 'Is Less Than':
        return { lt: parseInt(filterValue) };
      case 'Equal To':
        return { equals: parseInt(filterValue) };
      case 'Is Not Equal To':
        return { not: { equals: parseInt(filterValue) } };
      case 'Is Before Or Equal To':
        return { lte: new Date(filterValue) };
      case 'Is Before':
        return { lt: new Date(filterValue) };
      case 'Is After Or Equal To':
        return { gte: new Date(filterValue) };
      case 'Is After':
        return { gt: new Date(filterValue) };
    }
  }
}
