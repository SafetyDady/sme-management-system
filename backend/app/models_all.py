"""
SME Management System - Complete Models
This file imports all models for the SME Management System
"""

# Import existing authentication models
from .models import User, PasswordResetToken

# Import SME module models (lean phase: only HREmployee retained; leave & daily actual deferred)
from .models_hr import HREmployee
from .models_projects import Customer, Project, ProjectTask
from .models_inventory import InventoryCategory, InventoryItem, InventoryTransaction, InventoryStock
from .models_financial import (
    FinancialAccount, 
    FinancialTransaction, 
    FinancialBudget, 
    FinancialReport, 
    FinancialPayment
)

# Export all models for easy import
__all__ = [
    # Authentication models
    "User",
    "PasswordResetToken",
    
    # HR models (lean)
    "HREmployee",
    
    # Project models
    "Customer",
    "Project",
    "ProjectTask",
    
    # Inventory models
    "InventoryCategory",
    "InventoryItem",
    "InventoryTransaction",
    "InventoryStock",
    
    # Financial models
    "FinancialAccount",
    "FinancialTransaction",
    "FinancialBudget",
    "FinancialReport",
    "FinancialPayment"
]

# Model relationships that need to be established after all models are loaded
def setup_cross_module_relationships():
    """
    Setup relationships between models from different modules
    This should be called after all models are imported
    """
    # Add relationships between HR and Projects
    # HREmployee.projects = relationship("Project", foreign_keys="Project.project_manager_id")
    
    # Add relationships between Projects and Inventory
    # Project.inventory_transactions = relationship("InventoryTransaction", foreign_keys="InventoryTransaction.project_id")
    
    # Add relationships between Projects and Financial
    # Project.financial_transactions = relationship("FinancialTransaction", foreign_keys="FinancialTransaction.project_id")
    # Project.budgets = relationship("FinancialBudget", foreign_keys="FinancialBudget.project_id")
    
    pass  # Relationships are already defined in individual model files

