DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cashbook') THEN
      CREATE DATABASE cashbook;
   END IF;
END
\$\$