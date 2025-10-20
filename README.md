#  String Analyzer Service — Backend Stage 1

A lightweight **RESTful API** that analyzes and manages string data.  
Built with **Node.js**, **Express**, and **modular architecture** (controllers, routes, middlewares).

---

##  Features

- Analyze strings (length, palindrome check, character frequencies, SHA-256 hash)
- Store analyzed strings persistently (JSON file-based)
- Retrieve all or individual strings
- Filter results using query parameters
- Natural language query support (e.g. “all palindromic strings”)
- Centralized error handling middleware
- Clean architecture: **Controller + Route + Middleware** pattern

---

## 📁 Project Structure

string-analyzer/
├── controllers/ # Core business logic
├── data/ # JSON storage
├── middlewares/ # Input validation & error handling
├── routes/ # Route definitions
├── utils/ # Helper functions (analysis logic)
└── index.js # App entry point

 # Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/Sadiq-jaafar/Backend-stage-One.git
cd Backend-stage-One

2️⃣ Install dependencies
npm install

3️⃣ Run the server
npm start

API Endpoints
🟢 POST /strings

Analyze and store a new string.

Request:

{
  "value": "madam"
}


Response:

{
  "id": "ac8f3b6a8790...",
  "value": "madam",
  "properties": {
    "length": 5,
    "word_count": 1,
    "is_palindrome": true,
    "character_frequency": { "m": 2, "a": 2, "d": 1 }
  },
  "created_at": "2025-10-17T10:02:00.000Z"
}


Status Codes:

201 → String successfully analyzed and saved

400 → Missing “value” field

409 → String already exists

🟡 GET /strings

Retrieve all stored strings.
Supports query filtering.

Query Parameters:

Parameter	Type	Description
is_palindrome	boolean	Filter palindrome strings
min_length	number	Minimum string length
max_length	number	Maximum string length
word_count	number	Exact word count
contains_character	string	Must include specific character

Example Request:

GET /strings?is_palindrome=true&contains_character=a


Response:

{
  "data": [
    {
      "id": "ac8f3b6a8790...",
      "value": "madam",
      "properties": {
        "length": 5,
        "word_count": 1,
        "is_palindrome": true
      },
      "created_at": "2025-10-17T10:02:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": "true",
    "contains_character": "a"
  }
}

🔵 GET /strings/:string_value

Retrieve analysis for a specific string value.

Example:

GET /strings/madam


Response:

{
  "id": "ac8f3b6a8790...",
  "value": "madam",
  "properties": {
    "length": 5,
    "word_count": 1,
    "is_palindrome": true
  },
  "created_at": "2025-10-17T10:02:00.000Z"
}


Status Codes:

200 → Found

404 → String not found

🔴 DELETE /strings/:string_value

Delete a stored string.

Example:

DELETE /strings/madam


Response:

204 No Content


Status Codes:

204 → Deleted successfully

404 → String not found

🟣 GET /strings/filter-by-natural-language

Query strings using simple natural language phrases.

Example Requests:

GET /strings/filter-by-natural-language?query=all single word palindromic strings
GET /strings/filter-by-natural-language?query=strings longer than 10 characters
GET /strings/filter-by-natural-language?query=strings containing the letter z


Response Example:

{
  "data": [
    {
      "id": "ac8f3b6a8790...",
      "value": "madam",
      "properties": {
        "length": 5,
        "word_count": 1,
        "is_palindrome": true
      }
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "is_palindrome": true,
      "word_count": 1
    }
  }
}


Status Codes:

200 → Success

400 → Could not interpret query