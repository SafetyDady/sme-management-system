from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class FinancialAccount(Base):
    __tablename__ = "financial_accounts"
    
    account_id = Column(Integer, primary_key=True, index=True)
    account_code = Column(String(20), unique=True, index=True, nullable=False)
    account_name = Column(String(200), nullable=False, index=True)
    account_type = Column(String(20), nullable=False, index=True)  # asset, liability, equity, income, expense
    parent_account_id = Column(Integer, ForeignKey("financial_accounts.account_id"), nullable=True)
    current_balance = Column(Numeric(15, 2), default=0)
    description = Column(Text, nullable=True)
    active_status = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    parent_account = relationship("FinancialAccount", remote_side=[account_id])
    creator = relationship("User", foreign_keys=[created_by])
    debit_transactions = relationship("FinancialTransaction", foreign_keys="FinancialTransaction.debit_account_id", back_populates="debit_account")
    credit_transactions = relationship("FinancialTransaction", foreign_keys="FinancialTransaction.credit_account_id", back_populates="credit_account")
    budgets = relationship("FinancialBudget", back_populates="account")

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    transaction_type = Column(String(20), nullable=False, index=True)  # income, expense, transfer, adjustment
    debit_account_id = Column(Integer, ForeignKey("financial_accounts.account_id"), nullable=False)
    credit_account_id = Column(Integer, ForeignKey("financial_accounts.account_id"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    description = Column(Text, nullable=True)
    reference_type = Column(String(20), nullable=True)  # project, payroll, purchase, etc.
    reference_id = Column(Integer, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=True)
    approved_by = Column(String, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approval_status = Column(String(10), default="pending", index=True)  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    debit_account = relationship("FinancialAccount", foreign_keys=[debit_account_id], back_populates="debit_transactions")
    credit_account = relationship("FinancialAccount", foreign_keys=[credit_account_id], back_populates="credit_transactions")
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])

class FinancialBudget(Base):
    __tablename__ = "financial_budgets"
    
    budget_id = Column(Integer, primary_key=True, index=True)
    budget_name = Column(String(200), nullable=False)
    budget_year = Column(Integer, nullable=False, index=True)
    budget_month = Column(Integer, nullable=True, index=True)  # NULL for annual budget
    account_id = Column(Integer, ForeignKey("financial_accounts.account_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=True)  # NULL for general budget
    budgeted_amount = Column(Numeric(15, 2), nullable=False)
    actual_amount = Column(Numeric(15, 2), default=0)
    variance_amount = Column(Numeric(15, 2), default=0)
    description = Column(Text, nullable=True)
    active_status = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    account = relationship("FinancialAccount", back_populates="budgets")
    creator = relationship("User", foreign_keys=[created_by])

class FinancialReport(Base):
    __tablename__ = "financial_reports"
    
    report_id = Column(Integer, primary_key=True, index=True)
    report_name = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False, index=True)  # balance_sheet, income_statement, cash_flow, etc.
    report_period_start = Column(Date, nullable=False)
    report_period_end = Column(Date, nullable=False)
    report_data = Column(Text, nullable=True)  # JSON data
    generated_at = Column(DateTime, default=datetime.utcnow)
    generated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    generator = relationship("User", foreign_keys=[generated_by])

class FinancialPayment(Base):
    __tablename__ = "financial_payments"
    
    payment_id = Column(Integer, primary_key=True, index=True)
    payment_date = Column(Date, nullable=False, index=True)
    payment_type = Column(String(20), nullable=False, index=True)  # cash, bank_transfer, check, credit_card
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="THB")
    exchange_rate = Column(Numeric(10, 4), default=1.0)
    reference_number = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    status = Column(String(20), default="pending", index=True)  # pending, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])

