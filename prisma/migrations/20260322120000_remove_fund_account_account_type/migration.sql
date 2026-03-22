-- DropFundAccountAccountType: 资金账户以名称为准，不再单独维护账户类型字段
DROP INDEX IF EXISTS "user_fund_accounts_userId_accountType_idx";
ALTER TABLE "user_fund_accounts" DROP COLUMN IF EXISTS "accountType";
