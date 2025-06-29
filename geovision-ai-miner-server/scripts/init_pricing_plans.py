#!/usr/bin/env python3
"""
Initialize default pricing plans for GeoVision AI Miner SaaS platform.

This script creates the default pricing plans (Starter, Professional, Enterprise)
with appropriate features and limits for geological exploration projects.
"""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.crud import create_pricing_plan
from app.schemas import PricingPlanCreate
from decimal import Decimal

def init_default_plans():
    """Initialize default pricing plans in the database."""
    db = SessionLocal()
    
    try:
        # Define default pricing plans
        plans = [
            {
                "name": "Starter",
                "description": "Perfect for small exploration projects and individual geologists. Get started with basic AI analysis and data management.",
                "price_monthly": Decimal("99.00"),
                "price_yearly": Decimal("990.00"),  # 2 months free
                "features": [
                    "Up to 5 projects",
                    "10GB storage",
                    "Basic AI analysis (up to 1000 samples)",
                    "Email support",
                    "Standard data import (CSV, Excel)",
                    "Basic reporting",
                    "Mobile-friendly interface",
                    "Data export capabilities"
                ],
                "limits": {
                    "projects": 5,
                    "storage_gb": 10,
                    "api_calls_per_month": 1000,
                    "users": 2,
                    "ai_analysis_per_month": 1000,
                    "data_imports_per_month": 50,
                    "reports_per_month": 10
                }
            },
            {
                "name": "Professional",
                "description": "Ideal for growing mining operations and exploration companies. Advanced features for comprehensive geological analysis.",
                "price_monthly": Decimal("299.00"),
                "price_yearly": Decimal("2990.00"),  # 2 months free
                "features": [
                    "Up to 25 projects",
                    "100GB storage",
                    "Advanced AI analysis (unlimited samples)",
                    "Priority support",
                    "Advanced data import (multiple formats)",
                    "Custom reporting and dashboards",
                    "API access",
                    "Team collaboration tools",
                    "Advanced analytics",
                    "Data validation tools",
                    "Integration capabilities",
                    "White-label options"
                ],
                "limits": {
                    "projects": 25,
                    "storage_gb": 100,
                    "api_calls_per_month": 10000,
                    "users": 10,
                    "ai_analysis_per_month": -1,  # Unlimited
                    "data_imports_per_month": 200,
                    "reports_per_month": 100
                }
            },
            {
                "name": "Enterprise",
                "description": "For large-scale mining operations and multinational companies. Custom solutions with dedicated support and advanced features.",
                "price_monthly": Decimal("999.00"),
                "price_yearly": Decimal("9990.00"),  # 2 months free
                "features": [
                    "Unlimited projects",
                    "1TB storage",
                    "Custom AI models",
                    "24/7 phone support",
                    "Custom integrations",
                    "Advanced analytics and ML",
                    "Dedicated account manager",
                    "SLA guarantee",
                    "On-premise deployment options",
                    "Custom training and workshops",
                    "Advanced security features",
                    "Compliance reporting",
                    "Multi-region deployment",
                    "Custom branding",
                    "Advanced user management"
                ],
                "limits": {
                    "projects": -1,  # Unlimited
                    "storage_gb": 1000,
                    "api_calls_per_month": 100000,
                    "users": 50,
                    "ai_analysis_per_month": -1,  # Unlimited
                    "data_imports_per_month": -1,  # Unlimited
                    "reports_per_month": -1  # Unlimited
                }
            }
        ]
        
        print("Creating default pricing plans...")
        
        for i, plan_data in enumerate(plans, 1):
            try:
                plan = PricingPlanCreate(**plan_data)
                created_plan = create_pricing_plan(db, plan)
                print(f"✓ Created {created_plan.name} plan (ID: {created_plan.plan_id})")
                print(f"  Monthly: ${created_plan.price_monthly}")
                print(f"  Yearly: ${created_plan.price_yearly}")
                print(f"  Features: {len(created_plan.features)} features")
                print(f"  Limits: {len(created_plan.limits)} limit types")
                print()
            except Exception as e:
                print(f"✗ Failed to create {plan_data['name']} plan: {str(e)}")
                continue
        
        print("Default pricing plans initialization completed!")
        
    except Exception as e:
        print(f"Error during initialization: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def verify_plans():
    """Verify that the plans were created successfully."""
    db = SessionLocal()
    
    try:
        from app.crud import get_pricing_plans
        plans = get_pricing_plans(db, active_only=True)
        
        print(f"\nVerification: Found {len(plans)} active pricing plans:")
        for plan in plans:
            print(f"  - {plan.name}: ${plan.price_monthly}/month, ${plan.price_yearly}/year")
        
        return len(plans) == 3  # Should have 3 plans
        
    except Exception as e:
        print(f"Error during verification: {str(e)}")
        return False
    finally:
        db.close()

def main():
    """Main function to run the initialization script."""
    print("GeoVision AI Miner - Pricing Plans Initialization")
    print("=" * 50)
    
    # Check if database is accessible
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
    except Exception as e:
        print(f"✗ Database connection failed: {str(e)}")
        print("Please ensure the database is running and accessible.")
        sys.exit(1)
    
    # Initialize plans
    try:
        init_default_plans()
        
        # Verify plans were created
        if verify_plans():
            print("\n✓ Pricing plans initialization completed successfully!")
            print("\nNext steps:")
            print("1. Configure Stripe integration for payment processing")
            print("2. Set up webhook endpoints for payment events")
            print("3. Configure usage tracking in your application")
            print("4. Test subscription creation and billing")
        else:
            print("\n✗ Verification failed. Please check the database.")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n✗ Initialization failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 