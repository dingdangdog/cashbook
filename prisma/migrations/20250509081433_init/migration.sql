BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[SystemSetting] (
    [id] INT NOT NULL,
    [title] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [keywords] NVARCHAR(1000),
    [version] NVARCHAR(1000),
    [openRegister] BIT NOT NULL CONSTRAINT [SystemSetting_openRegister_df] DEFAULT 0,
    [createDate] DATETIME2 NOT NULL CONSTRAINT [SystemSetting_createDate_df] DEFAULT CURRENT_TIMESTAMP,
    [updateBy] DATETIME2 NOT NULL CONSTRAINT [SystemSetting_updateBy_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SystemSetting_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [createDate] DATETIME2 NOT NULL CONSTRAINT [User_createDate_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Book] (
    [id] INT NOT NULL IDENTITY(1,1),
    [bookId] NVARCHAR(1000) NOT NULL,
    [bookName] NVARCHAR(1000) NOT NULL,
    [shareKey] NVARCHAR(1000),
    [userId] INT NOT NULL,
    [budget] FLOAT(53),
    [createDate] DATETIME2 NOT NULL CONSTRAINT [Book_createDate_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Book_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Flow] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [bookId] NVARCHAR(1000) NOT NULL,
    [day] NVARCHAR(1000) NOT NULL,
    [flowType] NVARCHAR(1000),
    [industryType] NVARCHAR(1000),
    [payType] NVARCHAR(1000),
    [money] FLOAT(53),
    [name] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [invoice] NVARCHAR(1000),
    [origin] NVARCHAR(1000),
    [attribution] NVARCHAR(1000),
    [eliminate] INT CONSTRAINT [Flow_eliminate_df] DEFAULT 0,
    CONSTRAINT [Flow_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Budget] (
    [id] INT NOT NULL IDENTITY(1,1),
    [bookId] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [month] NVARCHAR(1000) NOT NULL,
    [budget] FLOAT(53),
    [used] FLOAT(53),
    CONSTRAINT [Budget_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FixedFlow] (
    [id] INT NOT NULL IDENTITY(1,1),
    [bookId] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [month] NVARCHAR(1000),
    [money] FLOAT(53),
    [name] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [flowType] NVARCHAR(1000),
    [industryType] NVARCHAR(1000),
    [payType] NVARCHAR(1000),
    [attribution] NVARCHAR(1000),
    CONSTRAINT [FixedFlow_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TypeRelation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [bookId] NVARCHAR(1000) NOT NULL,
    [source] NVARCHAR(1000) NOT NULL,
    [target] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [TypeRelation_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
