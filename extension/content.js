// Content script for AI Agent Marketplace Extension
class ContentProtector {
    constructor() {
        this.isActive = false;
        this.protectedContent = [];
        this.userSettings = {};
        this.init();
    }

    async init() {
        try {
            // Load user settings from storage
            await this.loadSettings();
            
            // Check if protection is enabled
            if (this.userSettings.enabled) {
                this.activateProtection();
            }

            // Listen for messages from popup
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.handleMessage(request, sender, sendResponse);
                return true;
            });

            // Inject detection script
            this.injectDetectionScript();
            
            // Monitor for AI bot activity
            this.monitorAIBots();
            
        } catch (error) {
            console.error('ContentProtector init error:', error);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get([
                'enabled',
                'protectedContent',
                'apiEndpoint',
                'userToken'
            ]);
            
            this.userSettings = {
                enabled: result.enabled || false,
                protectedContent: result.protectedContent || [],
                apiEndpoint: result.apiEndpoint || 'http://localhost:3001',
                userToken: result.userToken || null
            };
            
            this.protectedContent = this.userSettings.protectedContent;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.local.set({
                enabled: this.userSettings.enabled,
                protectedContent: this.protectedContent,
                apiEndpoint: this.userSettings.apiEndpoint,
                userToken: this.userSettings.userToken
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    activateProtection() {
        this.isActive = true;
        this.addProtectionOverlay();
        this.monitorPageChanges();
        console.log('AI Agent Marketplace: Content protection activated');
    }

    deactivateProtection() {
        this.isActive = false;
        this.removeProtectionOverlay();
        console.log('AI Agent Marketplace: Content protection deactivated');
    }

    addProtectionOverlay() {
        // Add invisible overlay to detect AI bot interactions
        const overlay = document.createElement('div');
        overlay.id = 'ai-marketplace-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
        `;
        
        document.body.appendChild(overlay);
        
        // Add protection metadata to page
        this.addProtectionMetadata();
    }

    removeProtectionOverlay() {
        const overlay = document.getElementById('ai-marketplace-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.removeProtectionMetadata();
    }

    addProtectionMetadata() {
        // Add meta tags and data attributes to indicate protected content
        const meta = document.createElement('meta');
        meta.name = 'ai-marketplace-protected';
        meta.content = 'true';
        document.head.appendChild(meta);

        // Add data attributes to content elements
        const contentElements = document.querySelectorAll('article, .content, .post, .entry, main');
        contentElements.forEach((element, index) => {
            element.setAttribute('data-ai-marketplace-protected', 'true');
            element.setAttribute('data-content-id', `content-${Date.now()}-${index}`);
        });
    }

    removeProtectionMetadata() {
        const meta = document.querySelector('meta[name="ai-marketplace-protected"]');
        if (meta) {
            meta.remove();
        }

        const protectedElements = document.querySelectorAll('[data-ai-marketplace-protected]');
        protectedElements.forEach(element => {
            element.removeAttribute('data-ai-marketplace-protected');
            element.removeAttribute('data-content-id');
        });
    }

    injectDetectionScript() {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        script.onload = () => script.remove();
        (document.head || document.documentElement).appendChild(script);
    }

    monitorAIBots() {
        // Monitor for common AI bot user agents
        const aiBotPatterns = [
            /openai/i,
            /anthropic/i,
            /claude/i,
            /gpt/i,
            /chatgpt/i,
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i
        ];

        const userAgent = navigator.userAgent;
        const isAIBot = aiBotPatterns.some(pattern => pattern.test(userAgent));

        if (isAIBot && this.isActive) {
            this.handleAIBotAccess();
        }

        // Monitor for programmatic access patterns
        this.monitorProgrammaticAccess();
    }

    monitorProgrammaticAccess() {
        // Override common methods used by AI bots
        const originalFetch = window.fetch;
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;

        // Monitor fetch requests
        window.fetch = async (...args) => {
            if (this.isActive) {
                this.detectAIAccess('fetch', args);
            }
            return originalFetch.apply(this, args);
        };

        // Monitor XHR requests
        XMLHttpRequest.prototype.open = function(...args) {
            if (window.contentProtector && window.contentProtector.isActive) {
                window.contentProtector.detectAIAccess('xhr', args);
            }
            return originalXHROpen.apply(this, args);
        };

        // Monitor DOM queries
        document.querySelector = function(...args) {
            if (window.contentProtector && window.contentProtector.isActive) {
                window.contentProtector.detectAIAccess('querySelector', args);
            }
            return originalQuerySelector.apply(this, args);
        };

        document.querySelectorAll = function(...args) {
            if (window.contentProtector && window.contentProtector.isActive) {
                window.contentProtector.detectAIAccess('querySelectorAll', args);
            }
            return originalQuerySelectorAll.apply(this, args);
        };
    }

    detectAIAccess(method, args) {
        // Analyze the access pattern to determine if it's AI-related
        const accessData = {
            method,
            args: args.map(arg => typeof arg === 'string' ? arg.substring(0, 100) : typeof arg),
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Check if this looks like AI bot access
        if (this.isAIAccessPattern(accessData)) {
            this.handleAIBotAccess(accessData);
        }
    }

    isAIAccessPattern(accessData) {
        // Simple heuristic to detect AI bot access patterns
        const aiPatterns = [
            /content/i,
            /article/i,
            /text/i,
            /body/i,
            /main/i
        ];

        return aiPatterns.some(pattern => 
            accessData.args.some(arg => 
                typeof arg === 'string' && pattern.test(arg)
            )
        );
    }

    async handleAIBotAccess(accessData = null) {
        try {
            console.log('AI Agent Marketplace: AI bot access detected', accessData);

            // Get current page content info
            const pageInfo = this.getPageInfo();

            // Check if this page is registered for protection
            const isProtected = this.protectedContent.some(content => 
                content.url === pageInfo.url
            );

            if (isProtected) {
                // Log the access attempt
                await this.logAccessAttempt(pageInfo, accessData);
                
                // Show payment prompt or redirect
                this.showPaymentPrompt(pageInfo);
            } else {
                // Auto-register the page if user has enabled auto-protection
                if (this.userSettings.autoProtect) {
                    await this.autoRegisterPage(pageInfo);
                }
            }

        } catch (error) {
            console.error('Error handling AI bot access:', error);
        }
    }

    getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            description: this.getMetaDescription(),
            contentLength: document.body.textContent.length,
            timestamp: Date.now()
        };
    }

    getMetaDescription() {
        const metaDesc = document.querySelector('meta[name="description"]');
        return metaDesc ? metaDesc.getAttribute('content') : '';
    }

    async logAccessAttempt(pageInfo, accessData) {
        try {
            const response = await fetch(`${this.userSettings.apiEndpoint}/api/content/access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.userSettings.userToken}`
                },
                body: JSON.stringify({
                    url: pageInfo.url,
                    title: pageInfo.title,
                    ai_agent_id: 'detected-bot',
                    access_type: 'detected',
                    access_details: {
                        pageInfo,
                        accessData
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to log access attempt');
            }

        } catch (error) {
            console.error('Failed to log access attempt:', error);
        }
    }

    showPaymentPrompt(pageInfo) {
        // Create payment prompt overlay
        const prompt = document.createElement('div');
        prompt.id = 'ai-marketplace-prompt';
        prompt.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 1000000;
                max-width: 400px;
                text-align: center;
                font-family: system-ui, sans-serif;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333;">Content Access Required</h3>
                <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
                    This content is protected. AI agents must pay to access this content.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="ai-pay-btn" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Pay to Access</button>
                    <button id="ai-cancel-btn" style="
                        background: #e5e7eb;
                        color: #374151;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(prompt);

        // Handle button clicks
        document.getElementById('ai-pay-btn').onclick = () => {
            this.handlePayment(pageInfo);
            prompt.remove();
        };

        document.getElementById('ai-cancel-btn').onclick = () => {
            prompt.remove();
        };
    }

    async handlePayment(pageInfo) {
        try {
            // Redirect to payment page or open payment modal
            const paymentUrl = `${this.userSettings.apiEndpoint}/payment?url=${encodeURIComponent(pageInfo.url)}`;
            window.open(paymentUrl, '_blank');
        } catch (error) {
            console.error('Error handling payment:', error);
        }
    }

    async autoRegisterPage(pageInfo) {
        try {
            const response = await fetch(`${this.userSettings.apiEndpoint}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.userSettings.userToken}`
                },
                body: JSON.stringify({
                    title: pageInfo.title,
                    description: pageInfo.description,
                    url: pageInfo.url,
                    content_type: 'article',
                    price_per_access: 0.001, // Default price
                    requires_payment: true
                })
            });

            if (response.ok) {
                const content = await response.json();
                this.protectedContent.push({
                    id: content.data.content.id,
                    url: pageInfo.url,
                    title: pageInfo.title
                });
                await this.saveSettings();
            }

        } catch (error) {
            console.error('Failed to auto-register page:', error);
        }
    }

    monitorPageChanges() {
        // Monitor for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    processNewContent(element) {
        // Add protection to newly added content
        if (element.matches && element.matches('article, .content, .post, .entry')) {
            element.setAttribute('data-ai-marketplace-protected', 'true');
            element.setAttribute('data-content-id', `content-${Date.now()}-${Math.random()}`);
        }

        // Check child elements
        const contentElements = element.querySelectorAll('article, .content, .post, .entry');
        contentElements.forEach((el, index) => {
            if (!el.hasAttribute('data-ai-marketplace-protected')) {
                el.setAttribute('data-ai-marketplace-protected', 'true');
                el.setAttribute('data-content-id', `content-${Date.now()}-${index}`);
            }
        });
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'activate':
                this.activateProtection();
                sendResponse({ success: true });
                break;
            case 'deactivate':
                this.deactivateProtection();
                sendResponse({ success: true });
                break;
            case 'getStatus':
                sendResponse({
                    isActive: this.isActive,
                    protectedContent: this.protectedContent,
                    currentPage: this.getPageInfo()
                });
                break;
            case 'updateSettings':
                this.userSettings = { ...this.userSettings, ...request.settings };
                this.saveSettings();
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }
}

// Initialize content protector
window.contentProtector = new ContentProtector(); 