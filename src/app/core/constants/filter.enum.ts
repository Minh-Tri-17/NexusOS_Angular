export enum FilterType {
  String = 'String',
  Number = 'Number',
  Date = 'Date',
  Boolean = 'Boolean',
  Guid = 'Guid',
}

export enum FilterOperator {
  Like = 'Like',
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  GreaterThan = 'GreaterThan',
  GreaterOrEqual = 'GreaterOrEqual',
  LessThan = 'LessThan',
  LessOrEqual = 'LessOrEqual',
  Between = 'Between',
  Contains = 'Contains',
}
