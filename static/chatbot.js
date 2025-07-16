class ChatWidget {
    constructor() {
        this.chatHistory = [];
        this.isOpen = false;
        this.apiUrl = '/api/chat';
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Add event listeners
        this.addEventListeners();
    }

    initializeElements() {
        this.widget = document.getElementById('chat-widget');
        this.container = document.getElementById('chat-container');
        this.toggleBtn = document.getElementById('chat-toggle');
        this.closeBtn = document.getElementById('chat-close');
        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('chat-send');
    }

    addEventListeners() {
        // Toggle chat window
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Handle scroll to bottom on new messages
        this.messagesContainer.addEventListener('DOMNodeInserted', () => {
            this.scrollToBottom();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('hidden', !this.isOpen);
        if (this.isOpen) {
            this.input.focus();
            this.scrollToBottom();
        }
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Clear input
        this.input.value = '';
        this.input.style.height = 'auto';

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show loading indicator
        this.showLoading();

        try {
            // Send message to server
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: this.chatHistory
                }),
            });

            // Remove loading indicator
            this.hideLoading();

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Handle different response types
            switch (data.type) {
                case 'product':
                    this.addMessage(data.message, 'bot');
                    this.addProductList(data.products);
                    break;
                case 'order_request':
                    this.addMessage(data.message, 'bot');
                    break;
                case 'order':
                    this.addOrderDetails(data.order_details);
                    break;
                case 'error':
                    this.addErrorMessage(data.message);
                    break;
                case 'chat':
                default:
                    this.addMessage(data.message, 'bot');
            }

            // Update chat history
            this.chatHistory.push(
                { type: 'user', message: message },
                { type: 'bot', message: data.message }
            );

        } catch (error) {
            console.error('Error:', error);
            this.hideLoading();
            this.addErrorMessage('Sorry, something went wrong. Please try again later.');
        }
    }

    addMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(message)}
            </div>
        `;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addProductList(products) {
        const productListDiv = document.createElement('div');
        productListDiv.className = 'message bot';
        
        let productListHtml = '<div class="message-content"><div class="product-list">';
        products.forEach(product => {
            productListHtml += `
                <div class="product-item">
                    <span class="product-title">${this.escapeHtml(product.title)}</span>
                    <span class="product-price">$${product.price}</span>
                </div>
            `;
        });
        productListHtml += '</div></div>';
        
        productListDiv.innerHTML = productListHtml;
        this.messagesContainer.appendChild(productListDiv);
        this.scrollToBottom();
    }

    addOrderDetails(orderDetails) {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'message bot';
        orderDiv.innerHTML = `
            <div class="message-content">
                <strong>Order Status:</strong> ${this.escapeHtml(orderDetails.status)}<br>
                ${orderDetails.tracking_number ? 
                    `<strong>Tracking Number:</strong> ${this.escapeHtml(orderDetails.tracking_number)}` : 
                    ''}
            </div>
        `;
        this.messagesContainer.appendChild(orderDiv);
        this.scrollToBottom();
    }

    addErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message bot error';
        errorDiv.innerHTML = `
            <div class="message-content">
                ⚠️ ${this.escapeHtml(message)}
            </div>
        `;
        this.messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();
    }

    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.innerHTML = `
            <div class="loading">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    hideLoading() {
        const loadingElement = this.messagesContainer.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatWidget = new ChatWidget();
}); 