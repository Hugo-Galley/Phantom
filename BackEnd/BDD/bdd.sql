CREATE TABLE Users (
    id_user CHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    public_key TEXT NOT NULL,
    salt VARCHAR(28) NOT NULL,
    icon TEXT NULL,
    verification_hash VARCHAR(64) NULL
)ENGINE=InnoDB;

CREATE TABLE Conversation (
    id_conversation CHAR(36) PRIMARY KEY,
    id_user1 CHAR(36) NOT NULL,
    id_user2 CHAR(36) NOT NULL,
    CreateAt DATETIME NULL,
    FOREIGN KEY (id_user1) REFERENCES Users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_user2) REFERENCES Users(id_user) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE Messages (
    id_message CHAR(36) PRIMARY KEY,
    content LONGTEXT NOT NULL,
    id_receiver CHAR(36) NOT NULL,
    sendAt DATETIME NOT NULL,
    dataType TEXT NOT NULL,
    id_conversation CHAR(36) NOT NULL,
    FOREIGN KEY (id_receiver) REFERENCES Users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_conversation) REFERENCES Conversation(id_conversation) ON DELETE CASCADE
)ENGINE=InnoDB;