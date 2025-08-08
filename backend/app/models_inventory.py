from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class InventoryCategory(Base):
    __tablename__ = "inventory_categories"
    
    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), nullable=False, index=True)
    category_code = Column(String(20), unique=True, index=True, nullable=False)
    parent_category_id = Column(Integer, ForeignKey("inventory_categories.category_id"), nullable=True)
    description = Column(Text, nullable=True)
    active_status = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    parent_category = relationship("InventoryCategory", remote_side=[category_id])
    creator = relationship("User", foreign_keys=[created_by])
    items = relationship("InventoryItem", back_populates="category")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    item_id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(30), unique=True, index=True, nullable=False)
    item_name = Column(String(200), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("inventory_categories.category_id"), nullable=True)
    unit = Column(String(20), nullable=False)  # kg, pcs, m, etc.
    unit_cost = Column(Numeric(10, 2), nullable=True)
    reorder_level = Column(Numeric(10, 2), default=0)
    max_stock_level = Column(Numeric(10, 2), nullable=True)
    current_stock = Column(Numeric(10, 2), default=0, index=True)
    item_type = Column(String(20), nullable=True, index=True)  # material, tool, consumable, equipment
    location = Column(String(100), nullable=True)
    supplier_info = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    active_status = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    category = relationship("InventoryCategory", back_populates="items")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    transactions = relationship("InventoryTransaction", back_populates="item")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.item_id"), nullable=False)
    transaction_type = Column(String(20), nullable=False, index=True)  # in, out, adjustment, transfer
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=True)
    total_cost = Column(Numeric(12, 2), nullable=True)
    reference_type = Column(String(20), nullable=True)  # purchase, project, adjustment, etc.
    reference_id = Column(Integer, nullable=True)  # ID of reference document
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=True)
    transaction_date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    item = relationship("InventoryItem", back_populates="transactions")
    creator = relationship("User", foreign_keys=[created_by])

class InventoryStock(Base):
    __tablename__ = "inventory_stock"
    
    stock_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.item_id"), nullable=False)
    location = Column(String(100), nullable=True)
    quantity = Column(Numeric(10, 2), nullable=False, default=0)
    reserved_quantity = Column(Numeric(10, 2), nullable=False, default=0)
    available_quantity = Column(Numeric(10, 2), nullable=False, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    item = relationship("InventoryItem")
    updater = relationship("User", foreign_keys=[updated_by])

