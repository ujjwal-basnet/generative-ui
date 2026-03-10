# tool_ui_chatbot/tools.py
from langchain_core.tools import tool
from typing import List, Dict

# In-memory storage (replace with Redis/DB in production)
_carts: Dict[str, List[Dict]] = {}

PRODUCTS = [
    {"name": "Classic White Shirt", "price": 29.99, "image": "https://picsum.photos/id/1015/300/300"},
    {"name": "Navy Blue Polo", "price": 34.99, "image": "https://picsum.photos/id/106/300/300"},
    {"name": "Striped Oxford Shirt", "price": 39.99, "image": "https://picsum.photos/id/201/300/300"},
    {"name": "Black Slim Jeans", "price": 49.99, "image": "https://picsum.photos/id/237/300/300"},
    {"name": "Khaki Chinos", "price": 44.99, "image": "https://picsum.photos/id/318/300/300"},
    {"name": "Grey Hoodie", "price": 54.99, "image": "https://picsum.photos/id/669/300/300"},
    {"name": "Denim Jacket", "price": 69.99, "image": "https://picsum.photos/id/870/300/300"},
    {"name": "White Sneakers", "price": 59.99, "image": "https://picsum.photos/id/1018/300/300"},
]

def _get_cart(session_id: str) -> List[Dict]:
    """Return (and create if needed) the cart for this session."""
    return _carts.setdefault(session_id, [])


def _find_product(product_name: str):
    """Fuzzy match product by name."""
    name_lower = product_name.lower().strip()
    for p in PRODUCTS:
        if name_lower in p["name"].lower() or p["name"].lower() in name_lower:
            return p.copy()
    return None


def get_cart_data(session_id: str) -> Dict:
    """Return structured cart data for frontend widget."""
    cart = _get_cart(session_id)
    total = sum(item["price"] * item["quantity"] for item in cart)
    count = sum(item["quantity"] for item in cart)
    return {
        "items": [item.copy() for item in cart],
        "total": round(total, 2),
        "count": count,
    }


def update_cart_item(session_id: str, action: str, product_name: str, quantity: int = 0) -> Dict:
    """Direct cart mutation from UI buttons (no LLM involved)."""
    cart = _get_cart(session_id)
    product_name = product_name.strip()

    if action == "remove":
        cart[:] = [item for item in cart if item["name"] != product_name]
    elif action == "update":
        for item in cart:
            if item["name"] == product_name:
                if quantity > 0:
                    item["quantity"] = quantity
                else:
                    cart[:] = [i for i in cart if i["name"] != product_name]
                break
    return get_cart_data(session_id)


def make_tools(session_id: str):
    """Factory that returns tools bound to a specific session via closure."""

    @tool
    def add_to_cart(product_name: str, quantity: int = 1) -> str:
        """Add a product to the shopping cart by name.
        Use this when the user wants to add any item to their cart."""
        product = _find_product(product_name)
        if not product:
            return f"❌ Sorry, couldn't find '{product_name}'. Try one of: Classic White Shirt, Navy Blue Polo, etc."

        cart = _get_cart(session_id)

        # Increment existing item
        for item in cart:
            if item["name"] == product["name"]:
                item["quantity"] += quantity
                total = sum(i["price"] * i["quantity"] for i in cart)
                return f"✅ Added {quantity}x {product['name']} to cart! New total: ${total:.2f}"

        # New item
        new_item = {
            "name": product["name"],
            "price": product["price"],
            "quantity": quantity,
            "image": product["image"],
        }
        cart.append(new_item)
        total = sum(i["price"] * i["quantity"] for i in cart)
        return f"✅ Added {quantity}x {product['name']} (${product['price']:.2f} each) to cart! New total: ${total:.2f}"

    @tool
    def view_cart() -> str:
        """Show the user's current cart contents.
        Use this when the user asks to see, view, show my cart, what's in my cart, etc."""
        data = get_cart_data(session_id)
        if data["count"] == 0:
            return "🛒 Your cart is empty! Add some clothes."
        return f"🛒 Your cart has {data['count']} items (total ${data['total']:.2f}). The interactive widget below shows everything."

    return [add_to_cart, view_cart]