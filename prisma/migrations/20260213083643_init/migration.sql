-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL DEFAULT 'User',
    "email" VARCHAR(255),
    "roles" VARCHAR(50),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lightTheme" VARCHAR(50),
    "darkTheme" VARCHAR(50),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_flows" (
    "id" SERIAL NOT NULL,
    "flowNo" VARCHAR(50) NOT NULL,
    "userId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "flowType" VARCHAR(20),
    "industryType" VARCHAR(50),
    "payType" VARCHAR(50),
    "money" DOUBLE PRECISION,
    "name" VARCHAR(200),
    "description" VARCHAR(500),
    "invoice" VARCHAR(200),
    "origin" VARCHAR(200),
    "attribution" VARCHAR(100),
    "eliminate" INTEGER DEFAULT 0,

    CONSTRAINT "user_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "budget" DOUBLE PRECISION,
    "used" DOUBLE PRECISION,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_liabilities" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "occurDay" TIMESTAMP(3) NOT NULL,
    "money" DOUBLE PRECISION NOT NULL,
    "planType" INTEGER NOT NULL DEFAULT 0,
    "interestRate" DOUBLE PRECISION,
    "termCount" INTEGER,
    "termAmount" DOUBLE PRECISION,
    "status" INTEGER NOT NULL DEFAULT 0,
    "occurFlowId" INTEGER,

    CONSTRAINT "user_liabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_liability_repay_plans" (
    "id" SERIAL NOT NULL,
    "liabilityId" INTEGER NOT NULL,
    "termNo" INTEGER NOT NULL,
    "planDay" TIMESTAMP(3) NOT NULL,
    "planAmount" DOUBLE PRECISION NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_liability_repay_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_liability_repay_records" (
    "id" SERIAL NOT NULL,
    "liabilityId" INTEGER NOT NULL,
    "planId" INTEGER,
    "repayDay" TIMESTAMP(3) NOT NULL,
    "repayAmount" DOUBLE PRECISION NOT NULL,
    "flowId" INTEGER,
    "description" VARCHAR(500),

    CONSTRAINT "user_liability_repay_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_receivables" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "occurDay" TIMESTAMP(3) NOT NULL,
    "money" DOUBLE PRECISION NOT NULL,
    "planType" INTEGER NOT NULL DEFAULT 0,
    "interestRate" DOUBLE PRECISION,
    "termCount" INTEGER,
    "termAmount" DOUBLE PRECISION,
    "status" INTEGER NOT NULL DEFAULT 0,
    "occurFlowId" INTEGER,

    CONSTRAINT "user_receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_receivable_collect_plans" (
    "id" SERIAL NOT NULL,
    "receivableId" INTEGER NOT NULL,
    "termNo" INTEGER NOT NULL,
    "planDay" TIMESTAMP(3) NOT NULL,
    "planAmount" DOUBLE PRECISION NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_receivable_collect_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_receivable_collect_records" (
    "id" SERIAL NOT NULL,
    "receivableId" INTEGER NOT NULL,
    "planId" INTEGER,
    "collectDay" TIMESTAMP(3) NOT NULL,
    "collectAmount" DOUBLE PRECISION NOT NULL,
    "flowId" INTEGER,
    "description" VARCHAR(500),

    CONSTRAINT "user_receivable_collect_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_investment_products" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "productType" VARCHAR(50),
    "totalInvested" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReturn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentValue" DOUBLE PRECISION,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_investment_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_investment_details" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tradeType" VARCHAR(20) NOT NULL,
    "tradeDay" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "fee" DOUBLE PRECISION DEFAULT 0,
    "description" VARCHAR(500),
    "flowId" INTEGER,

    CONSTRAINT "user_investment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_fixed_flows" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" VARCHAR(7),
    "money" DOUBLE PRECISION,
    "name" VARCHAR(200),
    "description" VARCHAR(500),
    "flowType" VARCHAR(20),
    "industryType" VARCHAR(50),
    "payType" VARCHAR(50),
    "attribution" VARCHAR(100),

    CONSTRAINT "user_fixed_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_type_relations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "target" VARCHAR(100) NOT NULL,

    CONSTRAINT "user_type_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_ai_providers" (
    "id" VARCHAR(36) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "apiProtocol" VARCHAR(50) NOT NULL,
    "apiKey" VARCHAR(500),
    "apiEndpoint" VARCHAR(500),
    "name" VARCHAR(100) NOT NULL,
    "apiModel" VARCHAR(100),
    "apiVersion" VARCHAR(100),
    "temperature" DOUBLE PRECISION DEFAULT 0.5,
    "maxTokens" INTEGER DEFAULT 3000,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "extraConfig" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_ai_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_themes" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "mode" VARCHAR(20) NOT NULL,
    "colors" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortBy" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "description" VARCHAR(500),
    "keywords" VARCHAR(500),
    "version" VARCHAR(50),
    "openRegister" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_flows_flowNo_key" ON "user_flows"("flowNo");

-- CreateIndex
CREATE INDEX "user_liabilities_userId_idx" ON "user_liabilities"("userId");

-- CreateIndex
CREATE INDEX "user_liability_repay_plans_liabilityId_idx" ON "user_liability_repay_plans"("liabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "user_liability_repay_plans_liabilityId_termNo_key" ON "user_liability_repay_plans"("liabilityId", "termNo");

-- CreateIndex
CREATE INDEX "user_liability_repay_records_liabilityId_idx" ON "user_liability_repay_records"("liabilityId");

-- CreateIndex
CREATE INDEX "user_liability_repay_records_planId_idx" ON "user_liability_repay_records"("planId");

-- CreateIndex
CREATE INDEX "user_receivables_userId_idx" ON "user_receivables"("userId");

-- CreateIndex
CREATE INDEX "user_receivable_collect_plans_receivableId_idx" ON "user_receivable_collect_plans"("receivableId");

-- CreateIndex
CREATE UNIQUE INDEX "user_receivable_collect_plans_receivableId_termNo_key" ON "user_receivable_collect_plans"("receivableId", "termNo");

-- CreateIndex
CREATE INDEX "user_receivable_collect_records_receivableId_idx" ON "user_receivable_collect_records"("receivableId");

-- CreateIndex
CREATE INDEX "user_receivable_collect_records_planId_idx" ON "user_receivable_collect_records"("planId");

-- CreateIndex
CREATE INDEX "user_investment_products_userId_idx" ON "user_investment_products"("userId");

-- CreateIndex
CREATE INDEX "user_investment_details_productId_idx" ON "user_investment_details"("productId");

-- CreateIndex
CREATE INDEX "user_investment_details_userId_idx" ON "user_investment_details"("userId");

-- CreateIndex
CREATE INDEX "user_investment_details_tradeDay_idx" ON "user_investment_details"("tradeDay");

-- CreateIndex
CREATE INDEX "system_ai_providers_provider_isActive_idx" ON "system_ai_providers"("provider", "isActive");

-- CreateIndex
CREATE INDEX "system_ai_providers_isActive_idx" ON "system_ai_providers"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "system_themes_code_key" ON "system_themes"("code");

-- CreateIndex
CREATE INDEX "system_themes_isActive_idx" ON "system_themes"("isActive");

-- CreateIndex
CREATE INDEX "system_themes_isDefault_idx" ON "system_themes"("isDefault");
