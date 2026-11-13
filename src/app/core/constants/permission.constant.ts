const createCrudPermissions = <T extends string>(prefix: T) =>
  ({
    view: `${prefix}.View`,
    create: `${prefix}.Create`,
    update: `${prefix}.Update`,
    delete: `${prefix}.Delete`,
    import: `${prefix}.Import`,
    export: `${prefix}.Export`,
  }) as const;

export const PERMISSIONS = {
  country: createCrudPermissions('CatCountry'),
  province: createCrudPermissions('CatProvince'),
  ward: createCrudPermissions('CatWard'),
  contractType: createCrudPermissions('CatContractType'),
  leaveType: createCrudPermissions('CatLeaveType'),
  jobTitle: createCrudPermissions('CatJobTitle'),
  department: createCrudPermissions('CatDepartment'),
  contract: createCrudPermissions('Contract'),
  employee: createCrudPermissions('Employee'),
  user: createCrudPermissions('User'),
  role: createCrudPermissions('Role'),
} as const;

