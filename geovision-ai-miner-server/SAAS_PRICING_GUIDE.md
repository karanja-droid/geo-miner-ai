# GeoVision AI Miner - SaaS Pricing System Guide

## Overview

The GeoVision AI Miner platform includes a comprehensive SaaS pricing system that enables subscription-based billing, usage tracking, and payment processing. This system supports multiple pricing tiers, flexible billing cycles, and integration with payment processors like Stripe.

## Features

### Core Pricing Features
- **Multiple Pricing Tiers**: Starter, Professional, Enterprise plans
- **Flexible Billing Cycles**: Monthly and yearly subscriptions
- **Usage Tracking**: Monitor storage, API calls, users, and custom metrics
- **Automatic Billing**: Recurring payments with Stripe integration
- **Usage Limits**: Enforce plan-based resource limits
- **Billing History**: Complete audit trail of all transactions
- **Admin Dashboard**: Manage plans, subscriptions, and billing

### Technical Features
- **RESTful API**: Complete pricing management endpoints
- **Real-time Usage Monitoring**: Track usage as it happens
- **Webhook Support**: Stripe webhook integration for payment events
- **Multi-tenant Support**: Isolated billing per user/organization
- **Audit Logging**: Complete billing and usage audit trail

## Architecture

### Database Schema

#### Pricing Plans (`pricing_plans`)
```sql
- plan_id (UUID, Primary Key)
- name (String) - Plan name (e.g., "Starter", "Professional")
- description (Text) - Plan description
- price_monthly (Decimal) - Monthly price in USD
- price_yearly (Decimal) - Yearly price in USD
- features (JSON) - Array of included features
- limits (JSON) - Usage limits (storage, users, etc.)
- is_active (Boolean) - Whether plan is available
- created_at (DateTime) - Creation timestamp
```

#### Subscriptions (`subscriptions`)
```sql
- subscription_id (UUID, Primary Key)
- user_id (UUID, Foreign Key) - Reference to users table
- plan_id (UUID, Foreign Key) - Reference to pricing_plans table
- status (String) - active, cancelled, past_due, etc.
- billing_cycle (String) - monthly or yearly
- start_date (DateTime) - Subscription start date
- end_date (DateTime) - Subscription end date (if cancelled)
- auto_renew (Boolean) - Auto-renewal setting
- stripe_subscription_id (String) - External Stripe ID
- created_at (DateTime) - Creation timestamp
- updated_at (DateTime) - Last update timestamp
```

#### Usage Tracking (`usage`)
```sql
- usage_id (UUID, Primary Key)
- user_id (UUID, Foreign Key) - Reference to users table
- subscription_id (UUID, Foreign Key) - Reference to subscriptions table
- usage_type (String) - Type of usage (storage, api_calls, users, etc.)
- amount (Decimal) - Current usage amount
- limit (Decimal) - Usage limit for this type
- period_start (DateTime) - Billing period start
- period_end (DateTime) - Billing period end
- created_at (DateTime) - Creation timestamp
```

#### Billing Records (`billing`)
```sql
- billing_id (UUID, Primary Key)
- subscription_id (UUID, Foreign Key) - Reference to subscriptions table
- amount (Decimal) - Billing amount
- currency (String) - Currency code (default: USD)
- status (String) - pending, paid, failed, refunded
- billing_date (DateTime) - Date bill was generated
- due_date (DateTime) - Payment due date
- paid_date (DateTime) - Date payment was received
- stripe_invoice_id (String) - External Stripe invoice ID
- description (Text) - Billing description
- created_at (DateTime) - Creation timestamp
```

#### Payments (`payments`)
```sql
- payment_id (UUID, Primary Key)
- billing_id (UUID, Foreign Key) - Reference to billing table
- amount (Decimal) - Payment amount
- currency (String) - Currency code
- payment_method (String) - Payment method used
- status (String) - pending, completed, failed
- stripe_payment_id (String) - External Stripe payment ID
- transaction_date (DateTime) - Payment transaction date
- created_at (DateTime) - Creation timestamp
```

## Setup Instructions

### 1. Database Migration

Run the Alembic migrations to create the pricing tables:

```bash
# Navigate to the backend directory
cd geovision-ai-miner-server

# Run migrations
alembic upgrade head
```

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pricing Configuration
DEFAULT_CURRENCY=USD
BILLING_TIMEZONE=UTC
USAGE_TRACKING_ENABLED=true

# Email Configuration (for billing notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 3. Initialize Default Pricing Plans

Create a script to initialize default pricing plans:

```python
# scripts/init_pricing_plans.py
from app.database import SessionLocal
from app.crud import create_pricing_plan
from app.schemas import PricingPlanCreate

def init_default_plans():
    db = SessionLocal()
    
    plans = [
        {
            "name": "Starter",
            "description": "Perfect for small exploration projects",
            "price_monthly": 99.00,
            "price_yearly": 990.00,
            "features": [
                "Up to 5 projects",
                "10GB storage",
                "Basic AI analysis",
                "Email support",
                "Standard data import"
            ],
            "limits": {
                "projects": 5,
                "storage_gb": 10,
                "api_calls_per_month": 1000,
                "users": 2
            }
        },
        {
            "name": "Professional",
            "description": "Ideal for growing mining operations",
            "price_monthly": 299.00,
            "price_yearly": 2990.00,
            "features": [
                "Up to 25 projects",
                "100GB storage",
                "Advanced AI analysis",
                "Priority support",
                "Advanced data import",
                "Custom reporting",
                "API access"
            ],
            "limits": {
                "projects": 25,
                "storage_gb": 100,
                "api_calls_per_month": 10000,
                "users": 10
            }
        },
        {
            "name": "Enterprise",
            "description": "For large-scale mining operations",
            "price_monthly": 999.00,
            "price_yearly": 9990.00,
            "features": [
                "Unlimited projects",
                "1TB storage",
                "Custom AI models",
                "24/7 phone support",
                "Custom integrations",
                "Advanced analytics",
                "Dedicated account manager",
                "SLA guarantee"
            ],
            "limits": {
                "projects": -1,  # Unlimited
                "storage_gb": 1000,
                "api_calls_per_month": 100000,
                "users": 50
            }
        }
    ]
    
    for plan_data in plans:
        plan = PricingPlanCreate(**plan_data)
        create_pricing_plan(db, plan)
    
    db.close()

if __name__ == "__main__":
    init_default_plans()
```

Run the script:
```bash
python scripts/init_pricing_plans.py
```

### 4. Stripe Integration Setup

#### Install Stripe Python SDK
```bash
pip install stripe
```

#### Configure Stripe Webhooks
1. Go to your Stripe Dashboard
2. Navigate to Webhooks
3. Add endpoint: `https://your-domain.com/api/pricing/webhooks/stripe`
4. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

#### Update Webhook Handler
Implement the webhook handler in `app/api/endpoints/pricing.py`:

```python
import stripe
from fastapi import Request

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "invoice.payment_succeeded":
        handle_payment_succeeded(event["data"]["object"], db)
    elif event["type"] == "invoice.payment_failed":
        handle_payment_failed(event["data"]["object"], db)
    elif event["type"] == "customer.subscription.updated":
        handle_subscription_updated(event["data"]["object"], db)
    
    return {"status": "success"}
```

## API Usage

### Pricing Plans

#### Get All Plans
```bash
GET /api/pricing/plans
```

#### Get Specific Plan
```bash
GET /api/pricing/plans/{plan_id}
```

#### Create Plan (Admin)
```bash
POST /api/pricing/plans
Content-Type: application/json

{
  "name": "Custom Plan",
  "description": "Custom pricing plan",
  "price_monthly": 199.00,
  "price_yearly": 1990.00,
  "features": ["Feature 1", "Feature 2"],
  "limits": {
    "projects": 15,
    "storage_gb": 50
  }
}
```

### Subscriptions

#### Create Subscription
```bash
POST /api/pricing/subscriptions
Content-Type: application/json

{
  "plan_id": "plan-uuid",
  "billing_cycle": "monthly",
  "auto_renew": true
}
```

#### Get Current Subscription
```bash
GET /api/pricing/subscriptions/current
```

#### Update Subscription
```bash
PUT /api/pricing/subscriptions/{subscription_id}
Content-Type: application/json

{
  "billing_cycle": "yearly",
  "auto_renew": false
}
```

#### Cancel Subscription
```bash
POST /api/pricing/subscriptions/{subscription_id}/cancel
```

### Usage Tracking

#### Create Usage Record
```bash
POST /api/pricing/usage
Content-Type: application/json

{
  "usage_type": "storage",
  "amount": 5.5,
  "limit": 10.0,
  "period_start": "2024-01-01T00:00:00Z",
  "period_end": "2024-01-31T23:59:59Z"
}
```

#### Get Usage Summary
```bash
GET /api/pricing/usage/summary
```

#### Check Usage Limits
```bash
GET /api/pricing/usage/check?usage_type=storage&amount=2.5
```

### Billing

#### Get Billing History
```bash
GET /api/pricing/billing?skip=0&limit=10
```

#### Get Billing Summary
```bash
GET /api/pricing/billing/summary
```

## Frontend Integration

### React Components

#### Pricing Plans Component
```tsx
import { PricingPlans } from '@/components/pricing/PricingPlans';

function PricingPage() {
  return (
    <PricingPlans
      onSelectPlan={(plan) => {
        // Handle plan selection
        console.log('Selected plan:', plan);
      }}
      currentPlan="current-plan-id"
      billingCycle="monthly"
    />
  );
}
```

#### Usage Dashboard Component
```tsx
import { UsageDashboard } from '@/components/pricing/UsageDashboard';

function DashboardPage() {
  return <UsageDashboard />;
}
```

#### Subscription Manager Component
```tsx
import { SubscriptionManager } from '@/components/pricing/SubscriptionManager';

function AccountPage() {
  return (
    <SubscriptionManager
      onSubscriptionChange={() => {
        // Handle subscription changes
        console.log('Subscription updated');
      }}
    />
  );
}
```

### API Service Usage

```tsx
import { pricingService } from '@/services/pricingService';

// Get all pricing plans
const plans = await pricingService.plans.getPlans();

// Create subscription
const subscription = await pricingService.subscriptions.createSubscription({
  plan_id: 'plan-uuid',
  billing_cycle: 'monthly',
  auto_renew: true
});

// Get usage summary
const usage = await pricingService.usage.getUsageSummary();

// Check usage limits
const limits = await pricingService.usage.checkUsageLimits('storage', 5.5);
```

## Usage Tracking Implementation

### Automatic Usage Tracking

Implement usage tracking in your application logic:

```python
# Example: Track file upload usage
from app.crud import create_usage_record
from app.schemas import UsageCreate
from datetime import datetime, timedelta

def track_file_upload(user_id: str, file_size_mb: float, db: Session):
    # Calculate current billing period
    now = datetime.utcnow()
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
    
    # Create usage record
    usage = UsageCreate(
        usage_type="storage",
        amount=file_size_mb,
        limit=100.0,  # Get from user's plan
        period_start=period_start,
        period_end=period_end
    )
    
    create_usage_record(db, usage, user_id)
```

### API Call Tracking

```python
# Middleware to track API calls
from fastapi import Request
import time

async def track_api_usage(request: Request, call_next):
    start_time = time.time()
    
    # Get user from request
    user = get_current_user(request)
    
    response = await call_next(request)
    
    # Track API call
    if user:
        track_api_call(user.user_id, 1)  # Count as 1 API call
    
    return response
```

## Billing Automation

### Monthly Billing Job

Create a scheduled job for monthly billing:

```python
# jobs/billing_job.py
from app.crud import get_user_subscription, create_billing_record
from app.schemas import BillingCreate
from datetime import datetime, timedelta

def run_monthly_billing():
    db = SessionLocal()
    
    # Get all active subscriptions
    subscriptions = get_all_active_subscriptions(db)
    
    for subscription in subscriptions:
        # Create billing record
        billing = BillingCreate(
            amount=get_plan_price(subscription.plan_id, subscription.billing_cycle),
            currency="USD",
            billing_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=7),
            description=f"Monthly billing for {subscription.plan.name}"
        )
        
        create_billing_record(db, billing, subscription.subscription_id)
    
    db.close()
```

### Usage Limit Enforcement

```python
# Middleware to check usage limits
from app.crud import check_usage_limits

async def enforce_usage_limits(request: Request, call_next):
    user = get_current_user(request)
    
    if user:
        # Check if user can perform the action
        usage_check = check_usage_limits(db, user.user_id, "api_calls", 1)
        
        if not usage_check["allowed"]:
            return JSONResponse(
                status_code=429,
                content={"error": "Usage limit exceeded", "details": usage_check}
            )
    
    return await call_next(request)
```

## Monitoring and Analytics

### Key Metrics to Track

1. **Revenue Metrics**
   - Monthly Recurring Revenue (MRR)
   - Annual Recurring Revenue (ARR)
   - Churn rate
   - Average Revenue Per User (ARPU)

2. **Usage Metrics**
   - Storage usage per plan
   - API call patterns
   - Feature adoption rates
   - Usage limit violations

3. **Billing Metrics**
   - Payment success rates
   - Failed payment recovery
   - Subscription upgrades/downgrades
   - Billing cycle preferences

### Dashboard Queries

```sql
-- Monthly Recurring Revenue
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(amount) as mrr
FROM billing 
WHERE status = 'paid' 
GROUP BY month 
ORDER BY month;

-- Usage by Plan
SELECT 
    p.name as plan_name,
    AVG(u.percentage_used) as avg_usage_percentage
FROM usage u
JOIN subscriptions s ON u.subscription_id = s.subscription_id
JOIN pricing_plans p ON s.plan_id = p.plan_id
GROUP BY p.name;

-- Churn Rate
SELECT 
    DATE_TRUNC('month', end_date) as month,
    COUNT(*) as cancelled_subscriptions,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as churn_rate
FROM subscriptions 
WHERE status = 'cancelled'
GROUP BY month;
```

## Security Considerations

### Data Protection
- Encrypt sensitive billing data
- Implement PCI DSS compliance for payment processing
- Use secure API authentication
- Audit all billing operations

### Access Control
- Implement role-based access for billing operations
- Restrict admin functions to authorized users
- Log all billing-related actions
- Implement rate limiting on billing APIs

### Payment Security
- Use Stripe's secure payment processing
- Never store credit card information
- Implement webhook signature verification
- Use HTTPS for all billing communications

## Troubleshooting

### Common Issues

1. **Webhook Failures**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Monitor webhook delivery logs

2. **Usage Tracking Issues**
   - Verify usage record creation
   - Check billing period calculations
   - Monitor usage limit enforcement

3. **Billing Problems**
   - Check Stripe API connectivity
   - Verify subscription status
   - Monitor payment processing

### Debug Commands

```bash
# Check database migrations
alembic current
alembic history

# Test Stripe connection
python -c "import stripe; stripe.api_key='your_key'; print(stripe.Customer.list())"

# Check webhook endpoint
curl -X POST https://your-domain.com/api/pricing/webhooks/stripe
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Stripe webhooks configured
- [ ] Default pricing plans created
- [ ] Usage tracking implemented
- [ ] Billing automation scheduled
- [ ] Monitoring and alerts configured
- [ ] Security measures implemented
- [ ] Frontend components integrated
- [ ] API documentation updated

## Support

For technical support or questions about the SaaS pricing system:

1. Check the API documentation
2. Review the troubleshooting section
3. Contact the development team
4. Submit issues through the project repository

## License

This SaaS pricing system is part of the GeoVision AI Miner platform and follows the same licensing terms. 