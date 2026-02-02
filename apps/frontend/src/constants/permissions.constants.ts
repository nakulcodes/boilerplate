export enum PERMISSIONS_ENUM {
  // USER
  USER_CREATE = "user:create",
  USER_LIST_READ = "user:list:read",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_IMPORT = "user:import",
  USER_UPDATE_STATUS = "user:update-status",
  USER_IMPERSONATE = "user:impersonate",

  // ROLE
  ROLE_CREATE = "role:create",
  ROLE_UPDATE_STATUS = "role:update-status",
  ROLE_READ = "role:read",
  ROLE_LIST_READ = "role:list:read",
  ROLE_UPDATE = "role:update",

  // CHANNEL
  CHANNEL_CREATE = "channel:create",
  CHANNEL_LIST_READ = "channel:list:read",
  CHANNEL_UPDATE = "channel:update",
  CHANNEL_UPDATE_STATUS = "channel:update-status",

  // STORE
  CREATE_STORE = "store:create",
  STORE_LIST_READ = "store:list:read",
  STORE_TRIGGER_SYNC = "store:trigger-sync",
  STORE_CONFIG_API_CREDENTIALS = "store:config-api-credentials",
  STORE_UPDATE = "store:update",
  STORE_UPDATE_STATUS = "store:update-status",

  // PRODUCT
  PRODUCT_CREATE = "product:create",
  PRODUCT_IMPORT = "product:import",
  PRODUCT_LIST_READ = "product:list:read",
  PRODUCT_UPDATE = "product:update",
  PRODUCT_DETAILS_READ = "product:details:read",
  PRODUCT_SYNC = "product:sync",
  PRODUCT_UPDATE_STATUS = "product:update-status",
  PRODUCT_EXPORT = "product:export",

  // STORE PRODUCT
  STORE_PRODUCT_ADD = "store:product:add",
  STORE_PRODUCT_LIST = "store:product:list",
  STORE_PRODUCT_SYNC = "store:product:sync",
  STORE_PRODUCT_IMPORT = "store:product:import",
  STORE_PRODUCT_ADD_FILTER = "store:product:add-filter",

  // SYSTEM LOG
  SYSTEM_LOG_LIST = "system:log:list",

  // PARTNER
  PARTNER_CREATE = "partner:create",
  PARTNER_LIST_READ = "partner:list:read",
  PARTNER_READ = "partner:read",
  PARTNER_UPDATE_STATUS = "partner:update-status",
  PARTNER_UPDATE = "partner:update",

  // SYNC
  STORE_SYNC = "store:sync",
  CHANNEL_SYNC = "channel:sync",

  // PRICE LIST
  PRICE_LIST = "price-list",
  STORE_PRICE_LIST = "store:price-list",

  // WEBHOOK LOG
  WEBHOOK_LOG_LIST = "webhook:log:list",
  WEBHOOK_LOG_VIEW = "webhook:log:view",

  // CRON MONITORING
  CRON_MONITORING_READ = "cron:monitoring:read",
  CRON_MONITORING_ANALYTICS = "cron:monitoring:analytics",
}
