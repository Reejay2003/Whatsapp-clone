/* global use, db */

// Select your database (change name if needed)
use("chatAppDB");

/* =========================
   USER COLLECTION
   ========================= */
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "name"],
      properties: {
        email: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        password: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        profilePic: {
          bsonType: "string",
          description: "profile picture URL"
        },
        addedPpl: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "array of User ObjectIds"
        },
        e2ePublicKey: {
          bsonType: ["object", "null"],
          description: "E2EE public key (JWK)"
        },
        e2eKeyBackup: {
          bsonType: ["object", "null"],
          description: "Encrypted E2EE key backup"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

// UniqueCREATE UNIQUE INDEX FOR EMAIL
db.users.createIndex({ email: 1 }, { unique: true });

/* =========================
   MESSAGE COLLECTION
   ========================= */
db.createCollection("messages", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["senderId", "receiverId"],
      properties: {
        senderId: {
          bsonType: "objectId",
          description: "reference to User"
        },
        receiverId: {
          bsonType: "objectId",
          description: "reference to User"
        },
        text: {
          bsonType: "string"
        },
        image: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

console.log("Users and Messages collections created with schema validation.");