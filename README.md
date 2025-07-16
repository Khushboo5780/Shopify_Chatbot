# Shopify AI Chatbot

An AI-powered chatbot for Shopify websites that provides intelligent customer support using Google's Gemini API and Shopify's Admin API.

## Features

- Natural language processing for conversational responses
- Integration with Shopify Admin API for product and order information
- FAQ-based responses using Retrieval-Augmented Generation (RAG)
- Toggleable chat widget with modern design
- Mobile-responsive interface
- Context-aware conversations
- Secure API key management

## Prerequisites

- Python 3.8+
- Shopify Partner Account
- Google Cloud Project with Gemini API enabled
- Shopify Admin API Access Token

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd shopify-ai-chatbot
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SHOPIFY_ACCESS_TOKEN=your_shopify_admin_api_token
   SHOPIFY_SHOP_URL=your_shop.myshopify.com
   FLASK_SECRET_KEY=your_random_secret_key
   ```

4. **FAQ Data**
   - Place your FAQ data in `faq.json`
   - Format should be:
     ```json
     [
       {
         "question": "What is your return policy?",
         "answer": "You can return items within 30 days..."
       }
     ]
     ```

5. **Run the Application**
   ```bash
   python app.py
   ```

## Shopify Integration

1. **Get Shopify Admin API Access**
   - Go to your Shopify Partner Dashboard
   - Create a Custom App
   - Request Admin API Access
   - Generate Access Token with required scopes:
     - read_products
     - read_orders
     - read_customers

2. **Add Chat Widget to Shopify Theme**
   Add the following code just before the closing `</body>` tag in your theme.liquid file:

   ```html
   <script src="https://your-flask-server.com/static/chatbot.js"></script>
   <link rel="stylesheet" href="https://your-flask-server.com/static/styles.css">
   ```

## Security Considerations

- Store API keys securely in environment variables
- Use HTTPS for all API communications
- Implement rate limiting for API calls
- Validate all user inputs
- Keep dependencies updated

## API Rate Limits

- Gemini API: Manage costs by implementing caching
- Shopify: Stay within API call limits (default: 2 calls/second)
- Implement exponential backoff for retries

## Customization

The chatbot can be customized by:
- Modifying the CSS in `styles.css`
- Updating the chat widget HTML structure
- Adding new FAQ entries to `faq.json`
- Adjusting the AI model parameters in `app.py`

## Testing

Before deploying to production:
1. Test in a Shopify development store
2. Verify mobile responsiveness
3. Check cross-browser compatibility
4. Validate FAQ responses
5. Test Shopify API integration
6. Verify error handling

## Troubleshooting

Common issues and solutions:
- API Key Issues: Verify environment variables
- CORS Errors: Check server configuration
- Rate Limits: Implement proper caching
- Memory Usage: Monitor embedding storage

## Support

For issues and feature requests, please create an issue in the repository.

## License

MIT License - See LICENSE file for details 