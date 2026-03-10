from pydantic import BaseModel, Field
from typing import List, Optional


class WeatherInput(BaseModel):
    location: str = Field(..., description="City or place name")


class WeatherData(BaseModel):
    location: str
    temperature: float       # °C
    weather: str
    feels_like: float
    humidity: int
    wind_speed: float        # km/h
    icon: str                # emoji icon


class ProductInput(BaseModel):
    query: str = Field(..., description="Product search query e.g. 'hiking boots'")


class ProductData(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = None
    description: str
    image_url: str
    product_url: str
    product_id: str
    rating: float
    review_count: int
    badge: Optional[str] = None   # e.g. "Best Seller", "Sale"


class AddToCartInput(BaseModel):
    product_id: str = Field(..., description="Product identifier to add to cart")
    product_name: str = Field(..., description="Human-readable product name")
    price: float = Field(..., description="Product price")


class CartItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int


class CartConfirmation(BaseModel):
    success: bool
    message: str
    added_item: CartItem
    cart_total_items: int
    cart_total_price: float
    savings: Optional[float] = None