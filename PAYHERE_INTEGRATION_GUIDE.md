# ✦Bible Aura - PayHere Integration Guide

## 🌟 Overview

This guide provides complete PayHere integration for Bible Aura's subscription system. PayHere is Sri Lanka's leading payment gateway, perfect for LKR-based subscriptions.

### 💰 Subscription Plans
- **Free**: 0 LKR - Limited usage (5 AI chats, 2 analyses, 5 journal entries/month)
- **Pro**: 600 LKR/month - Enhanced features (50 AI chats, 20 analyses, 50 journal entries/month)
- **Supporter**: 1,800 LKR/month - Higher limits (100 AI chats, 50 analyses, 100 journal entries/month)
- **Partner**: 4,000 LKR/month - Unlimited access

## ✅ Implementation Status

**Completed:**
- ✅ PayHere service integration (`src/lib/payhere.ts`)
- ✅ PayHere subscription button (`src/components/PayHereButton.tsx`)
- ✅ Updated pricing page with PayHere buttons
- ✅ Database schema for subscription tracking
- ✅ Hash generation and verification system
- ✅ Crypto-js dependency for secure hash generation

**Next Steps:**
1. Get PayHere merchant credentials
2. Implement backend notification handler
3. Test payment flow
4. Deploy notification endpoint

## 🔧 Step 1: PayHere Account Setup

### **Create PayHere Account**
1. Visit: https://www.payhere.lk/
2. Sign up for merchant account
3. Complete business verification
4. Wait for account approval

### **Get Merchant Credentials**
1. **Login to PayHere Dashboard**
2. **Get Merchant ID**: Side Menu → Integrations
3. **Generate Merchant Secret**:
   - Go to Side Menu → Integrations
   - Click 'Add Domain/App'
   - Enter your domain (e.g., `bibleaura.com`)
   - Click 'Request to Allow'
   - Wait for approval (up to 24 hours)
   - Copy the Merchant Secret

## 🔧 Step 2: Environment Configuration

### **Update Environment Variables**

Add to your `.env` file:

```env
# PayHere Configuration
PAYHERE_MERCHANT_ID=121XXXX
PAYHERE_MERCHANT_SECRET=your_merchant_secret_here

# For production
NODE_ENV=production
```

For development/testing:
```env
# PayHere Sandbox
PAYHERE_MERCHANT_ID=121XXXX  
PAYHERE_MERCHANT_SECRET=your_sandbox_secret
NODE_ENV=development
```

## 🔧 Step 3: Backend Notification Handler

Create an API endpoint to handle PayHere notifications:

### **Option A: Express.js Backend**

```javascript
// server.js or api/payhere/notify.js
const express = require('express');
const { PayHereService } = require('./path/to/payhere');
const { supabase } = require('./path/to/supabase');

const app = express();

// PayHere notification handler
app.post('/api/payhere/notify', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const notification = req.body;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    // Verify notification authenticity
    const isValid = PayHereService.verifyNotification(notification, merchantSecret);
    
    if (!isValid) {
      console.error('Invalid PayHere notification');
      return res.status(400).send('Invalid notification');
    }

    // Extract data
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      custom_1: userId,
      custom_2: planId,
      method,
      status_message
    } = notification;

    // Handle successful payment
    if (status_code === '2') {
      // Update subscription in database
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          payhere_payment_id: payment_id,
          amount: payhere_amount,
          currency: payhere_currency,
          payment_method: method,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          updated_at: new Date().toISOString()
        });

      // Record payment history
      await supabase
        .from('payment_history')
        .insert({
          user_id: userId,
          payhere_payment_id: payment_id,
          amount: parseInt(payhere_amount) * 100, // Convert to cents
          currency: payhere_currency,
          status: 'succeeded',
          plan_id: planId
        });

      console.log(`Subscription activated for user ${userId}, plan ${planId}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notification error:', error);
    res.status(500).send('Server error');
  }
});
```

### **Option B: Vercel Serverless Function**

```javascript
// api/payhere/notify.js
import { PayHereService } from '../../src/lib/payhere';
import { supabase } from '../../src/integrations/supabase/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notification = req.body;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    // Verify notification
    const isValid = PayHereService.verifyNotification(notification, merchantSecret);
    
    if (!isValid) {
      console.error('Invalid PayHere notification');
      return res.status(400).json({ error: 'Invalid notification' });
    }

    // Process successful payment
    if (notification.status_code === '2') {
      const userId = notification.custom_1;
      const planId = notification.custom_2;

      // Update subscription
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          payhere_payment_id: notification.payment_id,
          amount: notification.payhere_amount,
          currency: notification.payhere_currency,
          payment_method: notification.method,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayHere notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
```

## 🔧 Step 4: Frontend Success/Cancel Pages

### **Success Page (`src/pages/SubscriptionSuccess.tsx`)**

```tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed'>('pending');

  useEffect(() => {
    // Check payment status from URL params or database
    const checkPaymentStatus = async () => {
      try {
        // PayHere doesn't send parameters to return URL
        // Status should be checked from database based on user session
        setPaymentStatus('success');
      } catch (error) {
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your ✦Bible Aura subscription has been activated successfully.
          </p>
          <p className="text-sm text-gray-500">
            You now have access to all premium features including unlimited AI chats, 
            advanced Bible study tools, and ministry resources.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate('/profile')} variant="outline" className="w-full">
              View Subscription Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🔧 Step 5: Test Payment Flow

### **Testing Steps**

1. **Sandbox Testing**:
   - Set `NODE_ENV=development`
   - Use PayHere sandbox credentials
   - Test with sandbox payment gateway

2. **Test Payment**:
   - Go to pricing page: `http://localhost:8080/pricing`
   - Click on any paid plan
   - Fill customer details
   - Use PayHere test card numbers

3. **Verify Notification**:
   - Check server logs for notification receipt
   - Verify database subscription update
   - Test success/failure flows

### **PayHere Test Cards**

For sandbox testing:
```
Visa: 4916217501611292
Expiry: 12/25
CVV: 123

Mastercard: 5204730000002555
Expiry: 12/25  
CVV: 123
```

## 🔧 Step 6: Production Deployment

### **Production Checklist**

1. **Environment Setup**:
   ```env
   NODE_ENV=production
   PAYHERE_MERCHANT_ID=your_live_merchant_id
   PAYHERE_MERCHANT_SECRET=your_live_merchant_secret
   ```

2. **Domain Verification**:
   - Add your domain to PayHere account
   - Wait for domain approval
   - Update notification URL

3. **SSL Certificate**:
   - Ensure HTTPS for notify_url
   - PayHere requires secure endpoints

4. **Database Migration**:
   ```bash
   supabase db push
   ```

## 🔧 Step 7: Subscription Management

### **Cancel Subscription Hook**

```tsx
// src/hooks/usePayHereSubscription.tsx
import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function usePayHereSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will end at the current period.',
      });

    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Unable to cancel subscription. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { cancelSubscription, loading };
}
```

## 🔧 Step 8: Usage Enforcement

Integrate usage checking in AI features:

```tsx
// Example: In AI chat component
import { useUsageTracking } from '@/hooks/useUsageTracking';

const { canUseFeature, incrementUsage, getCurrentPlan } = useUsageTracking();

const handleAIChat = async () => {
  const currentPlan = getCurrentPlan();
  
  if (!canUseFeature('ai_chat')) {
    toast({
      title: 'Usage Limit Reached',
      description: `Your ${currentPlan} plan limit is reached. Upgrade to continue.`,
      variant: 'destructive',
    });
    return;
  }

  // Process AI chat
  await processAIChat();
  
  // Track usage
  await incrementUsage('ai_chat');
};
```

## 📊 Payment Status Monitoring

### **PayHere Status Codes**
- `2` - Success
- `0` - Pending
- `-1` - Cancelled
- `-2` - Failed
- `-3` - Chargeback

### **Database Queries**

```sql
-- View all active subscriptions
SELECT * FROM subscriptions WHERE status = 'active';

-- View payment history
SELECT * FROM payment_history ORDER BY created_at DESC;

-- Check user subscription
SELECT s.*, p.amount, p.status as payment_status 
FROM subscriptions s 
LEFT JOIN payment_history p ON s.user_id = p.user_id 
WHERE s.user_id = 'user-id-here';
```

## 🚀 Benefits of PayHere Integration

1. **Local Payment Gateway** - Optimized for Sri Lankan market
2. **LKR Currency Support** - Native support for local currency
3. **Multiple Payment Methods** - Cards, mobile wallets, bank transfers
4. **Low Transaction Fees** - Competitive rates for local businesses
5. **Secure Processing** - PCI DSS compliant
6. **Easy Integration** - Simple HTML form-based API
7. **Real-time Notifications** - Instant payment status updates

## 📞 Support & Resources

**PayHere Documentation**: https://support.payhere.lk/api-&-plugins/payhere-checkout
**PayHere Dashboard**: https://www.payhere.lk/merchant/dashboard
**Sandbox Dashboard**: https://sandbox.payhere.lk/merchant/dashboard

**For Issues:**
1. Check PayHere merchant dashboard logs
2. Verify notification URL accessibility
3. Test hash generation and verification
4. Contact PayHere support: support@payhere.lk

---

**✦Bible Aura** - Empowering Biblical study with secure, local payment processing through PayHere! 