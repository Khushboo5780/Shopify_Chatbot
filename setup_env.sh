#!/bin/bash

# Create .env file
cat > .env << EOL
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Shopify API Configuration
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_ACCESS_TOKEN=your_shopify_admin_api_access_token_here
SHOPIFY_SHOP_URL=your-store.myshopify.com

# Flask Configuration
FLASK_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(16))')
FLASK_ENV=development  # Change to production for deployment
EOL

echo "Created .env file with template values."
echo "Please edit the .env file and replace the placeholder values with your actual API keys and credentials."
echo "A random Flask secret key has been generated for you." 