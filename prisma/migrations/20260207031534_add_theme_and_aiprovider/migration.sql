-- CreateTable
CREATE TABLE "translation_configs" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "apiProtocol" VARCHAR(50) NOT NULL,
    "apiKey" VARCHAR(500),
    "apiEndpoint" VARCHAR(500),
    "apiModel" VARCHAR(100),
    "apiVersion" VARCHAR(100),
    "temperature" DOUBLE PRECISION DEFAULT 0.5,
    "maxTokens" INTEGER DEFAULT 3000,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "extraConfig" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
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

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translation_configs_provider_isActive_idx" ON "translation_configs"("provider", "isActive");

-- CreateIndex
CREATE INDEX "translation_configs_isActive_idx" ON "translation_configs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "themes_code_key" ON "themes"("code");

-- CreateIndex
CREATE INDEX "themes_mode_isActive_idx" ON "themes"("mode", "isActive");
