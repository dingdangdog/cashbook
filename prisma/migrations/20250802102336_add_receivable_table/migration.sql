BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Receivable] (
    [id] INT NOT NULL IDENTITY(1,1),
    [occurId] INT,
    [actualId] INT,
    [bookId] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [name] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [occurDay] NVARCHAR(1000) NOT NULL,
    [expectDay] NVARCHAR(1000),
    [actualDay] NVARCHAR(1000),
    [money] FLOAT(53),
    [status] INT NOT NULL CONSTRAINT [Receivable_status_df] DEFAULT 0,
    CONSTRAINT [Receivable_pkey] PRIMARY KEY CLUSTERED ([id])
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
