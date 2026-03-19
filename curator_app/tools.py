# curator_app/tools.py
from langchain_core.tools import tool
from typing import List, Dict

# In-memory storage (replace with Redis/DB in production)
_carts: Dict[str, List[Dict]] = {}

PRODUCTS = [
    {
        "name": "Obsidian Vase I",
        "variant": "Matte Black",
        "price": 180.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAXMUp3ENquEnPFtm-Lu77dVvYmjtNOt2Xtm1BnA10WDFKK0ViA_VZKuC1zFsAqmoX7SI5WGY0dr3ZSuX1qxgp_TPdBw8Xu7CaCQST3APn0geYYemv07uckYsfVFQCYpxDkFjCF9ooaMJGjrGnlFAdZqgNte9yHUsW38voykKXgHXxqXlLgEPCppG_wi-jIKWmaNhWZFkOPLzIU1ywZyjjtejTbPSCZxBCpFjNRiaPkVAq2jaKngom1vOIxFeiHbzyp-Y3-eFhSWqd_",
    },
    {
        "name": "Ebon Scents No.4",
        "variant": "Black Marble",
        "price": 65.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Fh4O4rTQh2hBax2ptE7yYMFkgj8Rt6WL0pSShtmBAF8X8QFElVfpaWBIQMKixFjBVJrMTPpTMjBhCbLKwc0NXFCzH1e32Ah4NiwvR2G3_-bXevd4gJbYb3WYpeJ5gXMsOwK9lBqHFqI5auktbBp0E1RPrDPaX78vV8aM3B_NUvJSnN6R3tYYCkhV0EFe0Ck4EEcuH_B6BBRp04qHbKpX8C-xCV0WjtPLPQ33zJE0AOkbPI1zLjjYDfCKlmO_tchcKZ22I4asTVSf",
    },
    {
        "name": "Monolith Chrono",
        "variant": "Silver Mesh",
        "price": 320.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAy52ZAPMZADMztFg5MgeedYQOriZjpnGXbfBAf_G6doukMAoyxErvHE_3JREY9OZ79f7Ya1AbI4rAUsPCIBm8y1lia2Jut8Gz3MmWvkwPnPV0tbZ91u_q7o8G_KaO17I8tUYTcUb0UHoYOsxvXtg8BG1uze29AMq-erXkjvWruAdUpAi2RKsNztd_yema60BEGyCBiT8uffT9JU7mVMWSvVuyBZaV4YqWk31LVNKrVPMFATO1nOOFEB2qldP_tEQv1a9pDtYTW06ZX",
    },
    {
        "name": "Acoustic Shell V2",
        "variant": "Studio Black",
        "price": 450.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAVII5y1DskhpPXYb89SKUgR1ZGlsfPNX7TqzI3EVjM5YgeUeUYZjirF7yIqhcCrWMJSSt6nd9bTjz3u-0cwx0RXMSdrKZlD2lxy9Yb3TBp8FrGU0IKmIOial8m_BEgswbukyckPSzkU8MbQ5awjwHOHAuR3uPUxXdGNakUqsr1dFPY-_BSxJiqWsc_xDGeB9jQhIhelk8GFYtGhaac8QrXrViBvnKXhsk5hh1MRheg41p-L61VBQc6SQHrTJNtsJaMm3wS27qZckwD",
    },
    {
        "name": "Sable Tote",
        "variant": "Italian Leather",
        "price": 210.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuB52FOaEkzTCOI9MCtxYZpLV7NAqcTH1UPq5vv4mNcKs8nGwYRCu48GOg-uLWGMHMgLITdWst3QTVp4_ZpEUCnmbQF_vMCcCPysEiAtyYhlxxXYrjeEusgxWEHrndUKcgPvG-70I5dDTWbB0b8OXjNlCHjWvFJ7caFjfZysGHZoeBYYWQ6rRNf74T_pyzjhsXEtWB6G4cNw7HNDH4LiTW-ME5yx-dH31NHEN924gt3hz6Bh_IUSplrrLs-DW-FNwQP7WmG5c6VvpHKn",
    },
    {
        "name": "Mono Chronograph",
        "variant": "Satin Black",
        "price": 240.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBRYEz2UyvohuLFL1T05HdzSbR5SxdXqM-O4tN2x7Qp0d867nLojBiklcILmldDhmITnoGSH93QRTGmEGhGblqwrZoeZ7EctHpdyOzetUWz1rmuZSZbULNJcqY9nfjFHUeDASZxW1sjvNJXxexojlLWPspFjVoYEm9I37c99Tixc-t8RWpkuzTDMpEJTkTbfVSCyJSaTKIX1E0CkvRUeaxUadUp583Xij-M-xi6FZ-tDI5StY3BLl6_qeOQ0nYWuQNGwqjER2_h0KxS",
    },
    {
        "name": "Opaque Essence",
        "variant": "Frosted Glass",
        "price": 85.00,
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAeiXSvXwFyC-Bk7RKKmM818IIMtWbqgZRc0flGHjgAmVUobmlNScGBLpQzB_qUTWOqb_9Q6idMppqCjvmQ-rFdBKteD28VkWrju1FlGC7ULzMX0kEBMjoC0IHhkk0yF_J_98jJh3pD34lQZ9KYtV9704ndKyuydWjDkh7UiJz0Ckzg1WZFhLALKfYeK7QA-OXbiQVgsFLujQIg1aJVbeoYw9Nsl_lVvafYKveGjlr1B5x_q7fQREMPuaRuUZgHJVRurH3sUbJprHZm",
    },
    {
        "name": "Void Pendant",
        "variant": "Obsidian",
        "price": 145.00,
        "image": "https://picsum.photos/seed/pendant/300/300",
    },
    {
        "name": "Ceramic Pour-Over",
        "variant": "Porcelain White",
        "price": 95.00,
        "image": "https://picsum.photos/seed/pourover/300/300",
    },
    {
        "name": "Linen Throw",
        "variant": "Natural Oat",
        "price": 120.00,
        "image": "https://picsum.photos/seed/linen/300/300",
    },
]


def _get_cart(session_id: str) -> List[Dict]:
    return _carts.setdefault(session_id, [])


def _find_product(product_name: str):
    name_lower = product_name.lower().strip()
    for p in PRODUCTS:
        if name_lower in p["name"].lower() or p["name"].lower() in name_lower:
            return p.copy()
    return None


def get_cart_data(session_id: str) -> Dict:
    cart = _get_cart(session_id)
    total = sum(item["price"] * item["quantity"] for item in cart)
    count = sum(item["quantity"] for item in cart)
    return {
        "items": [item.copy() for item in cart],
        "total": round(total, 2),
        "count": count,
    }


def update_cart_item(session_id: str, action: str, product_name: str, quantity: int = 0) -> Dict:
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
    elif action == "add":
        product = _find_product(product_name)
        if product:
            for item in cart:
                if item["name"] == product["name"]:
                    item["quantity"] += max(quantity, 1)
                    return get_cart_data(session_id)
            cart.append({
                "name": product["name"],
                "variant": product.get("variant", ""),
                "price": product["price"],
                "quantity": max(quantity, 1),
                "image": product["image"],
            })
    return get_cart_data(session_id)


def make_tools(session_id: str):
    """Factory that returns tools bound to a specific session via closure."""

    @tool
    def search_products(query: str = "") -> str:
        """Search for products in the store catalog.
        Use this when the user asks to see products, browse items, search for something, etc.
        Returns a JSON-like list of products matching the query."""
        query_lower = query.lower().strip()
        if query_lower:
            matches = [p for p in PRODUCTS if query_lower in p["name"].lower() or query_lower in p.get("variant", "").lower()]
            if not matches:
                matches = PRODUCTS
        else:
            matches = PRODUCTS
        lines = [f"{p['name']} ({p.get('variant', '')}) - ${p['price']:.2f}" for p in matches]
        return "PRODUCTS_FOUND:" + "|".join([p["name"] for p in matches]) + "\n" + "\n".join(lines)

    @tool
    def add_to_cart(product_name: str, quantity: int = 1) -> str:
        """Add a product to the shopping cart by name.
        Use this when the user wants to add any item to their cart."""
        product = _find_product(product_name)
        if not product:
            return f"Could not find '{product_name}'. Available: " + ", ".join(p["name"] for p in PRODUCTS)

        cart = _get_cart(session_id)
        for item in cart:
            if item["name"] == product["name"]:
                item["quantity"] += quantity
                total = sum(i["price"] * i["quantity"] for i in cart)
                return f"CART_UPDATED:Added {quantity}x {product['name']} to cart. Total: ${total:.2f}"

        cart.append({
            "name": product["name"],
            "variant": product.get("variant", ""),
            "price": product["price"],
            "quantity": quantity,
            "image": product["image"],
        })
        total = sum(i["price"] * i["quantity"] for i in cart)
        return f"CART_UPDATED:Added {quantity}x {product['name']} (${product['price']:.2f}) to cart. Total: ${total:.2f}"

    @tool
    def view_cart() -> str:
        """Show the user's current cart contents.
        Use this when the user asks to see, view, or show their cart."""
        data = get_cart_data(session_id)
        if data["count"] == 0:
            return "CART_EMPTY:Your cart is empty. Browse our collection to find something you love."
        items_str = ", ".join(f"{i['name']} x{i['quantity']}" for i in data["items"])
        return f"CART_VIEW:{data['count']} items, ${data['total']:.2f} total. Items: {items_str}"

    @tool
    def get_weather(location: str) -> str:
        """Get current weather for a location.
        Use this when the user asks about weather."""
        import random
        temp = random.randint(15, 30)
        conditions = random.choice(["Sunny", "Partly Cloudy", "Overcast", "Light Rain"])
        return f"WEATHER:{location}|{temp}|{conditions}"

    return [search_products, add_to_cart, view_cart, get_weather]
