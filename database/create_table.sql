CREATE DATABASE speech_to_text;
GO

USE speech_to_text;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE test_results (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    spoken_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL,
    actual_text NVARCHAR(MAX) NULL,
    timestamp DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);