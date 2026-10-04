export enum FilterType {
  string = 'String',
  number = 'Number',
  date = 'Date',
  boolean = 'Boolean',
  guid = 'Guid',
}

export enum FilterOperator {
  like = 'Like',
  equal = 'Equal',
  notEqual = 'NotEqual',
  greaterThan = 'GreaterThan',
  greaterOrEqual = 'GreaterOrEqual',
  lessThan = 'LessThan',
  lessOrEqual = 'LessOrEqual',
  between = 'Between',
  contains = 'Contains',
}
