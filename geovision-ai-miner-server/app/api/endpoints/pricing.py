from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID

from ... import crud, schemas, models
from ...database import get_db
from ...auth import get_current_user

router = APIRouter(prefix="/pricing", tags=["pricing"])

# Pricing Plans
@router.get("/plans", response_model=List[schemas.PricingPlan])
def get_pricing_plans(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all available pricing plans"""
    return crud.get_pricing_plans(db, skip=skip, limit=limit, active_only=active_only)

@router.get("/plans/{plan_id}", response_model=schemas.PricingPlan)
def get_pricing_plan(plan_id: UUID, db: Session = Depends(get_db)):
    """Get a specific pricing plan"""
    plan = crud.get_pricing_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Pricing plan not found")
    return plan

@router.post("/plans", response_model=schemas.PricingPlan)
def create_pricing_plan(
    plan: schemas.PricingPlanCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new pricing plan (admin only)"""
    # TODO: Add admin role check
    return crud.create_pricing_plan(db, plan)

@router.put("/plans/{plan_id}", response_model=schemas.PricingPlan)
def update_pricing_plan(
    plan_id: UUID,
    plan: schemas.PricingPlanUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update a pricing plan (admin only)"""
    # TODO: Add admin role check
    updated_plan = crud.update_pricing_plan(db, plan_id, plan)
    if not updated_plan:
        raise HTTPException(status_code=404, detail="Pricing plan not found")
    return updated_plan

# Subscriptions
@router.post("/subscriptions", response_model=schemas.Subscription)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new subscription for the current user"""
    # Check if user already has an active subscription
    existing_subscription = crud.get_user_subscription(db, current_user.user_id)
    if existing_subscription:
        raise HTTPException(
            status_code=400,
            detail="User already has an active subscription"
        )
    
    return crud.create_subscription(db, subscription, current_user.user_id)

@router.get("/subscriptions/current", response_model=schemas.Subscription)
def get_current_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get the current user's active subscription"""
    subscription = crud.get_user_subscription(db, current_user.user_id)
    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )
    return subscription

@router.put("/subscriptions/{subscription_id}", response_model=schemas.Subscription)
def update_subscription(
    subscription_id: UUID,
    subscription: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update subscription settings"""
    # Verify user owns this subscription
    existing_subscription = crud.get_subscription(db, subscription_id)
    if not existing_subscription or existing_subscription.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    updated_subscription = crud.update_subscription(db, subscription_id, subscription)
    return updated_subscription

@router.post("/subscriptions/{subscription_id}/cancel", response_model=schemas.Subscription)
def cancel_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Cancel a subscription"""
    # Verify user owns this subscription
    existing_subscription = crud.get_subscription(db, subscription_id)
    if not existing_subscription or existing_subscription.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    cancelled_subscription = crud.cancel_subscription(db, subscription_id)
    return cancelled_subscription

# Usage Tracking
@router.post("/usage", response_model=schemas.Usage)
def create_usage_record(
    usage: schemas.UsageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a usage record for the current user"""
    return crud.create_usage_record(db, usage, current_user.user_id)

@router.get("/usage", response_model=List[schemas.Usage])
def get_user_usage(
    usage_type: Optional[str] = None,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get usage records for the current user"""
    return crud.get_user_usage(
        db, current_user.user_id, usage_type, period_start, period_end
    )

@router.get("/usage/summary")
def get_usage_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get current usage summary for the user"""
    return crud.get_current_usage_summary(db, current_user.user_id)

@router.get("/usage/check")
def check_usage_limits(
    usage_type: str,
    amount: Decimal,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Check if user can use the specified amount of a resource"""
    return crud.check_usage_limits(db, current_user.user_id, usage_type, amount)

# Billing
@router.get("/billing", response_model=List[schemas.Billing])
def get_billing_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get billing history for the current user"""
    return crud.get_user_billing_history(db, current_user.user_id, skip, limit)

@router.get("/billing/{billing_id}", response_model=schemas.Billing)
def get_billing(
    billing_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific billing record"""
    billing = crud.get_billing(db, billing_id)
    if not billing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    # Verify user owns this billing record
    subscription = crud.get_subscription(db, billing.subscription_id)
    if not subscription or subscription.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    return billing

@router.get("/billing/summary")
def get_billing_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get comprehensive billing summary for user dashboard"""
    summary = crud.get_billing_summary(db, current_user.user_id)
    if not summary:
        raise HTTPException(
            status_code=404,
            detail="No billing information found"
        )
    return summary

# Payments
@router.post("/payments", response_model=schemas.Payment)
def create_payment(
    payment: schemas.PaymentCreate,
    billing_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a payment record"""
    # Verify user owns this billing record
    billing = crud.get_billing(db, billing_id)
    if not billing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    subscription = crud.get_subscription(db, billing.subscription_id)
    if not subscription or subscription.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    return crud.create_payment(db, payment, billing_id)

@router.get("/payments/{payment_id}", response_model=schemas.Payment)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific payment record"""
    payment = crud.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    # Verify user owns this payment record
    billing = crud.get_billing(db, payment.billing_id)
    subscription = crud.get_subscription(db, billing.subscription_id)
    if not subscription or subscription.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    return payment

# Webhook endpoints for Stripe integration
@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: dict,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks for payment events"""
    # TODO: Implement Stripe webhook handling
    # This would verify the webhook signature and process events
    # like payment success, subscription updates, etc.
    return {"status": "received"}

# Admin endpoints
@router.get("/admin/subscriptions", response_model=List[schemas.Subscription])
def get_all_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all subscriptions (admin only)"""
    # TODO: Add admin role check
    # This would require implementing admin role checking
    pass

@router.get("/admin/usage", response_model=List[schemas.Usage])
def get_all_usage(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all usage records (admin only)"""
    # TODO: Add admin role check
    pass 