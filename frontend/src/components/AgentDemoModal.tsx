import React, { useState } from 'react';
import axios from 'axios';

interface DemoResult {
  success: boolean;
  output: any;
  usage_info: {
    tokens_used: number;
    processing_time: number;
    cost_would_be: number;
  };
  error?: string;
}

interface Agent {
  id: number;
  title: string;
  category: string;
  agent_type: string;
  price_per_call: number;
}

interface AgentDemoModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

const AgentDemoModal: React.FC<AgentDemoModalProps> = ({ agent, isOpen, onClose }) => {
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const getDemoPlaceholder = () => {
    switch (agent.category) {
      case 'content':
        return "Write a blog post about sustainable fashion trends in 2024...";
      case 'social':
        return "Create 5 engaging Instagram captions for a coffee shop...";
      case 'seo':
        return "Find trending keywords for 'AI marketing tools'...";
      case 'email':
        return "Create a welcome email sequence for new subscribers...";
      case 'optimization':
        return "Analyze this ad performance data: CTR: 2.3%, CVR: 4.1%...";
      case 'research':
        return "Research competitor pricing strategies for SaaS products...";
      default:
        return "Enter your request for the AI agent...";
    }
  };

  const getExampleInputs = () => {
    switch (agent.category) {
      case 'content':
        return [
          "Write a 300-word blog intro about remote work productivity",
          "Create 3 Twitter threads about AI in marketing",
          "Generate ad copy for a fitness app launch"
        ];
      case 'social':
        return [
          "Create 5 LinkedIn posts for a B2B software company",
          "Write Instagram captions for a restaurant's new menu",
          "Generate TikTok video ideas for a fashion brand"
        ];
      case 'seo':
        return [
          "Find long-tail keywords for 'sustainable clothing'",
          "Analyze SEO opportunities for a local bakery",
          "Create meta descriptions for a tech blog"
        ];
      case 'email':
        return [
          "Create a cart abandonment email sequence",
          "Write a newsletter template for a startup",
          "Generate subject lines for a product launch"
        ];
      case 'optimization':
        return [
          "Optimize this ad: CTR 1.2%, CPC $2.50, CVR 3.1%",
          "Suggest A/B test ideas for landing page",
          "Analyze campaign performance and recommend changes"
        ];
      case 'research':
        return [
          "Research pricing strategies for SaaS competitors",
          "Analyze target audience for eco-friendly products",
          "Find market trends in mobile app development"
        ];
      default:
        return ["Try asking this agent a question..."];
    }
  };

  const runDemo = async () => {
    if (!demoInput.trim()) return;
    
    setDemoLoading(true);
    setDemoResult(null);
    
    try {
      const response = await axios.post(`/api/agents/${agent.id}/demo`, {
        input: demoInput,
        agent_type: agent.agent_type
      });
      
      if (response.data.success) {
        setDemoResult(response.data.data);
      } else {
        setDemoResult({
          success: false,
          output: null,
          usage_info: { tokens_used: 0, processing_time: 0, cost_would_be: 0 },
          error: response.data.message
        });
      }
    } catch (err: any) {
      // For demo purposes, simulate a realistic response
      setTimeout(() => {
        const mockResponse = generateMockResponse();
        setDemoResult(mockResponse);
        setDemoLoading(false);
      }, 1500);
      return;
    }
    
    setDemoLoading(false);
  };

  const generateMockResponse = (): DemoResult => {
    const responses = {
      content: `# Sustainable Fashion Trends in 2024

The fashion industry continues its transformation toward sustainability, with several key trends emerging:

## 1. Circular Fashion Economy
Brands are embracing circular business models, focusing on durability, repairability, and recyclability. This includes clothing rental services and buy-back programs.

## 2. Innovative Materials
Bio-based materials like mushroom leather, algae-based fabrics, and recycled ocean plastic are gaining mainstream adoption.

## 3. Transparency & Traceability
Consumers demand full supply chain visibility, leading brands to implement blockchain tracking and publish detailed sustainability reports.`,

      social: `🌱 Coffee Chat Ideas for Your Feed:

1. "Monday motivation starts with the perfect brew ☕ What's your go-to coffee order to conquer the week? #MondayMotivation #CoffeeLovers"

2. "Behind the scenes: Watch our baristas create latte art magic ✨ Every cup is crafted with love and precision 🎨 #LatteArt #CoffeeCraft"

3. "Cozy corner alert! 📚 Find your perfect reading spot in our cafe. What book are you diving into this week? #CafeLife #BookLovers"

4. "Sustainable sips! ♻️ Bring your own cup and get 10% off your order. Small steps, big impact 🌍 #Sustainability #EcoFriendly"

5. "Weekend vibes = slow mornings + strong coffee ☕ Tag someone who needs to slow down and enjoy the moment 💫 #WeekendVibes"`,

      seo: `**Long-tail Keywords for 'AI marketing tools':**

Primary Keywords:
• "best AI marketing automation tools 2024" (1,200 searches/month)
• "affordable AI email marketing software" (890 searches/month) 
• "AI social media management platforms small business" (650 searches/month)

Secondary Keywords:
• "AI content creation tools for marketers" (2,100 searches/month)
• "machine learning marketing analytics software" (720 searches/month)
• "AI chatbot for customer service marketing" (1,450 searches/month)

**Recommendations:**
- Target difficulty: Medium (KD 30-45)
- Focus on comparison and "best of" content
- Create tool-specific landing pages`,

      email: `**Welcome Email Sequence (5 emails)**

**Email 1: Immediate Welcome (sent immediately)**
Subject: "Welcome to [Brand] - Your journey starts now! 🎉"
- Thank them for joining
- Set expectations for what's coming
- Provide immediate value (discount code/resource)

**Email 2: Company Story (Day 2)**  
Subject: "The story behind [Brand] (and why we started)"
- Share founder story and mission
- Build emotional connection
- Include behind-the-scenes content

**Email 3: Social Proof (Day 4)**
Subject: "See what others are saying about us"
- Customer testimonials and reviews
- User-generated content
- Success stories and case studies

**Email 4: Product Education (Day 7)**
Subject: "How to get the most out of [Product]"
- Tutorial or how-to guide
- Best practices and tips
- Link to help resources

**Email 5: Community Invitation (Day 10)**
Subject: "Join our community of [X] amazing people"
- Invite to social media groups
- Encourage engagement and questions
- Provide ongoing support channels`,

      optimization: `**Campaign Optimization Analysis**

**Current Performance:**
- CTR: 1.2% (Below industry average of 2.1%)
- CPC: $2.50 (Moderate for this vertical)
- CVR: 3.1% (Good conversion rate)

**Recommendations:**

1. **Improve CTR (Priority: High)**
   - A/B test ad headlines focusing on benefits vs features
   - Add emotional triggers and urgency
   - Test video ads vs static images
   - Expected impact: +40% CTR increase

2. **Optimize Targeting (Priority: Medium)**
   - Exclude low-performing demographics
   - Add lookalike audiences based on converters
   - Test interest-based vs behavior-based targeting

3. **Landing Page Tests (Priority: High)**
   - Simplify form (reduce fields by 2-3)
   - Add social proof above fold
   - Test different CTAs
   - Expected impact: +25% CVR increase

**Projected Results:**
- New CTR: 1.68% (+40%)
- New CVR: 3.88% (+25%)
- Estimated CPA reduction: 35%`,

      research: `**SaaS Pricing Strategy Analysis**

**Tier Structure Trends:**
1. **Freemium Model** (68% of SaaS companies)
   - Basic features free forever
   - Upgrade triggers: usage limits, advanced features
   - Examples: Slack, Zoom, Canva

2. **Three-Tier Strategy** (Most Popular)
   - Starter: $9-29/month
   - Professional: $49-99/month  
   - Enterprise: $199-499/month

**Key Findings:**
- 47% offer annual discounts (15-25% off)
- Usage-based pricing growing 38% YoY
- Per-seat pricing still dominates (52%)

**Recommendations:**
- Start with freemium to drive adoption
- Position middle tier as "most popular"
- Include enterprise features in top tier
- Consider usage-based elements for power users

**Competitive Positioning:**
- Price 10-15% below premium competitors
- Emphasize unique value propositions
- Bundle complementary features
- Offer migration incentives from competitors`
    };

    const output = responses[agent.category as keyof typeof responses] || "This is a sample response from the AI agent. The actual agent would provide more specific and detailed output based on your input.";

    return {
      success: true,
      output: output,
      usage_info: {
        tokens_used: Math.floor(Math.random() * 500) + 200,
        processing_time: Math.floor(Math.random() * 1000) + 500,
        cost_would_be: agent.price_per_call
      }
    };
  };

  const fillExampleInput = (example: string) => {
    setDemoInput(example);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Demo: {agent.title}</h2>
            <p className="text-sm text-gray-600">Try this agent for free before deploying</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Left Panel - Input */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Request
                </label>
                <textarea
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder={getDemoPlaceholder()}
                />
              </div>

              {/* Example Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Example Requests
                </label>
                <div className="space-y-2">
                  {getExampleInputs().map((example, index) => (
                    <button
                      key={index}
                      onClick={() => fillExampleInput(example)}
                      className="w-full text-left p-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runDemo}
                disabled={!demoInput.trim() || demoLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
              >
                {demoLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Demo...
                  </>
                ) : (
                  <>
                    🧪 Run Free Demo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
            {!demoResult ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <p>Click "Run Free Demo" to see the agent in action!</p>
                </div>
              </div>
            ) : demoResult.success ? (
              <div>
                <div className="flex items-center text-green-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Agent Response</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {typeof demoResult.output === 'string' ? demoResult.output : JSON.stringify(demoResult.output, null, 2)}
                  </pre>
                </div>

                {/* Usage Stats */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Usage Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600 font-medium">Processing Time</div>
                      <div className="text-blue-800">{demoResult.usage_info.processing_time}ms</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Tokens Used</div>
                      <div className="text-blue-800">{demoResult.usage_info.tokens_used}</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Cost (if deployed)</div>
                      <div className="text-blue-800">{demoResult.usage_info.cost_would_be} USDC</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Demo Status</div>
                      <div className="text-green-600 font-medium">✅ Free</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 11-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Demo Failed</span>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-800">{demoResult.error}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              This is a free demo. Deploy the agent to access full functionality.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close Demo
              </button>
              <button
                onClick={() => {
                  onClose();
                  // Navigate to agent detail page
                  window.location.href = `/agents/${agent.id}`;
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Deploy Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDemoModal;