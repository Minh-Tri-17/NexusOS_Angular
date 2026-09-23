export const API_CONSTANTS = {
  country: {
    create: 'CatCountry/Create',
    update: 'CatCountry/Update',
    softDelete: 'CatCountry/SoftDelete',
    hardDelete: 'CatCountry/HardDelete',
    getPaging: 'CatCountry/GetPaging/Filter',
    getById: 'CatCountry/GetOne',
    import: 'CatCountry/Import',
    export: 'CatCountry/Export',
  },
  account: {
    login: 'Account/Authentication',
    sendOTP: 'Account/SendOTP',
    resetPass: 'Account/ResetPassword',
  },
};
