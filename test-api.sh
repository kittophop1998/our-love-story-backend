#!/bin/bash

# Test script for Letter API endpoints
BASE_URL="http://localhost:8083"

echo "🧪 Testing Letter API Endpoints"
echo "================================"
echo ""

# Test 1: Upload Attachment
echo "📤 Test 1: Upload Attachment"
echo "Creating a test image file..."
# Create a simple test file
echo "test image content" > test-image.txt

echo "Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/letters/upload-attachment" \
  -F "file=@test-image.txt")

echo "Response: $UPLOAD_RESPONSE"
echo ""

# Extract fileUrl from response (requires jq)
if command -v jq &> /dev/null; then
    FILE_URL=$(echo $UPLOAD_RESPONSE | jq -r '.data.fileUrl')
    echo "✅ File URL: $FILE_URL"
else
    echo "⚠️  Install 'jq' to automatically extract file URL"
    FILE_URL="http://localhost:9000/assets/attachments/test.jpg"
fi

echo ""
echo "---"
echo ""

# Test 2: Create Letter
echo "💌 Test 2: Create Letter"
echo "Creating letter with attachments..."

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/letters/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Letter 💖\",
    \"message\": \"This is a test letter\",
    \"senderName\": \"Test User\",
    \"coverImageUrl\": \"$FILE_URL\",
    \"attachments\": [
      {
        \"fileUrl\": \"$FILE_URL\",
        \"text\": \"Test image\",
        \"type\": \"image\",
        \"order\": 1
      }
    ]
  }")

echo "Response: $CREATE_RESPONSE"
echo ""

if command -v jq &> /dev/null; then
    PUBLIC_ID=$(echo $CREATE_RESPONSE | jq -r '.data.publicId')
    EDIT_TOKEN=$(echo $CREATE_RESPONSE | jq -r '.data.editToken')
    echo "✅ Public ID: $PUBLIC_ID"
    echo "✅ Edit Token: $EDIT_TOKEN"
fi

echo ""
echo "---"
echo ""
echo "✨ Testing complete!"

# Cleanup
rm -f test-image.txt
