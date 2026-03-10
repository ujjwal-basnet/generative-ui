from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
import asyncio
from .schemas import WeatherInput, WeatherData, ProductInput, ProductData, AddToCartInput, CartConfirmation, CartItem
from typing import List, Tuple

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, streaming=True)

_cart: dict[str, CartItem] = {}


@tool(args_schema=WeatherInput, response_format="content_and_artifact")
async def get_weather(location: str) -> Tuple[str, dict]:
    """Get current weather information for a given location."""
    await asyncio.sleep(0.5)
    data = WeatherData(location=location, temperature=19.5, weather="Partly Cloudy",
                       feels_like=18.0, humidity=62, wind_speed=12.0, icon="⛅")
    return f"Weather in {location}: {data.temperature}°C", data.model_dump()


@tool(args_schema=ProductInput, response_format="content_and_artifact")
async def search_products(query: str) -> Tuple[str, list]:
    """Search for products based on a query string."""
    await asyncio.sleep(0.8)
    q = query.lower()

    if any(w in q for w in ["boot", "hiking", "trail", "trekking"]):
        products = [
            ProductData(name="Merrell Moab 3 GTX", price=129.99, original_price=159.99,
                description="Waterproof leather hiking boot with Vibram outsole.",
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
                product_url="https://www.amazon.com/dp/B09XYZ",
                product_id="merrell-moab-3-gtx", rating=4.7, review_count=2341, badge="Best Seller"),
            ProductData(name="Salomon X Ultra 4 GTX", price=169.99, original_price=None,
                description="Lightweight trail shoe with Advanced Chassis technology.",
                image_url="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
                product_url="https://www.amazon.com/dp/B09ABC",
                product_id="salomon-x-ultra-4-gtx", rating=4.5, review_count=987, badge=None),
            ProductData(name="Columbia Newton Ridge Plus II", price=89.99, original_price=110.0,
                description="Budget-friendly waterproof hiking boot with Omni-Grip traction.",
                image_url="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
                product_url="https://www.amazon.com/dp/B07ABC",
                product_id="columbia-newton-ridge-ii", rating=4.3, review_count=5621, badge="Sale"),
        ]
    elif any(w in q for w in ["backpack", "bag", "pack"]):
        products = [
            ProductData(name="Osprey Atmos AG 65", price=289.99, original_price=320.00,
                description="Anti-gravity suspension 65L backpack for multi-day adventures.",
                image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
                product_url="https://www.amazon.com/dp/B09DEF",
                product_id="osprey-atmos-ag-65", rating=4.8, review_count=1234, badge="Top Rated"),
        ]
    else:
        products = [
            ProductData(name=f"Premium {query.title()}", price=99.99, original_price=129.99,
                description=f"Top-rated {query} for outdoor enthusiasts.",
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
                product_url="https://www.amazon.com/",
                product_id=f"{query.lower().replace(' ', '-')}-001",
                rating=4.4, review_count=312, badge="Sale"),
        ]

    return f"Found {len(products)} products", [p.model_dump() for p in products]


@tool(args_schema=AddToCartInput, response_format="content_and_artifact")
async def add_to_cart(product_id: str, product_name: str, price: float) -> Tuple[str, dict]:
    """Add a product to the user's cart."""
    await asyncio.sleep(0.3)
    if product_id in _cart:
        _cart[product_id].quantity += 1
    else:
        _cart[product_id] = CartItem(product_id=product_id, product_name=product_name,
                                      price=price, quantity=1)
    total_items = sum(i.quantity for i in _cart.values())
    total_price = round(sum(i.price * i.quantity for i in _cart.values()), 2)
    result = CartConfirmation(success=True, message=f"{product_name} added!",
                               added_item=_cart[product_id],
                               cart_total_items=total_items, cart_total_price=total_price)
    return result.message, result.model_dump()


tools = [get_weather, search_products, add_to_cart]
agent = create_react_agent(llm, tools)
