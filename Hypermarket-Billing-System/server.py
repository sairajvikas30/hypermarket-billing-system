"""
Hypermarket Billing System - Python/Flask Backend
Converted from TypeScript/Express + MySQL to Python/Flask + MySQL
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from functools import wraps

import bcrypt
import jwt
import mysql.connector
from mysql.connector import pooling
from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

PORT = int(os.getenv("PORT", 3000))
JWT_SECRET = os.getenv("JWT_SECRET", "hypermarket-secret-key")

# ---------------------------------------------------------------------------
# Database pool
# ---------------------------------------------------------------------------

db_pool: pooling.MySQLConnectionPool | None = None


def get_connection():
    """Get a connection from the pool."""
    return db_pool.get_connection()


def initialize_db():
    """Create database + tables + seed data if they don't exist."""
    global db_pool

    # Step 1 – connect without a database to CREATE it if missing
    tmp = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
    )
    cur = tmp.cursor()
    db_name = os.getenv("DB_NAME", "billing_app")
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
    cur.close()
    tmp.close()

    # Step 2 – create the pool pointing at that database
    db_pool = pooling.MySQLConnectionPool(
        pool_name="billing_pool",
        pool_size=10,
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=db_name,
        autocommit=False,
    )

    conn = get_connection()
    cur = conn.cursor()

    # --- Schema ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            age VARCHAR(50),
            mobile VARCHAR(50),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            mobile VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255),
            points INT,
            language VARCHAR(50)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            barcode VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10, 2),
            stock INT,
            minStock INT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(255) PRIMARY KEY,
            barcode VARCHAR(255),
            name VARCHAR(255),
            quantity INT,
            status VARCHAR(50),
            deliveryTime VARCHAR(255)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(255) PRIMARY KEY,
            message TEXT,
            date VARCHAR(255),
            type VARCHAR(50)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(255) PRIMARY KEY,
            items TEXT,
            total DECIMAL(10, 2),
            paymentMethod VARCHAR(50),
            customerMobile VARCHAR(50),
            date VARCHAR(255),
            status VARCHAR(50)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INT PRIMARY KEY DEFAULT 1,
            storeName VARCHAR(255),
            storeAddress TEXT,
            storePhone VARCHAR(50),
            gstNumber VARCHAR(50),
            currency VARCHAR(10),
            taxPercentage DECIMAL(5, 2),
            billHeader TEXT,
            billFooter TEXT,
            defaultLanguage VARCHAR(50)
        )
    """)

    # Seed default settings
    cur.execute("SELECT COUNT(*) FROM settings")
    if cur.fetchone()[0] == 0:
        cur.execute("""
            INSERT INTO settings
                (id, storeName, storeAddress, storePhone, gstNumber, currency,
                 taxPercentage, billHeader, billFooter, defaultLanguage)
            VALUES
                (1, 'Hypermarket Billing System', '123 Market Street, City, State',
                 '+91 98765 43210', '22AAAAA0000A1Z5', '₹', 18,
                 'Welcome to Our Store', 'Thank You for Shopping with Us!', 'English')
        """)

    # Seed default products
    cur.execute("SELECT COUNT(*) FROM products")
    if cur.fetchone()[0] == 0:
        default_products = [
            ("1001", "Milk 1L",       60,  50,  10),
            ("1002", "Bread",          40,  30,   5),
            ("1003", "Eggs 12pk",      80,  20,   5),
            ("1004", "Apple 1kg",     180, 100,  20),
            ("1005", "Rice 5kg",      350,  15,   5),
            ("1006", "Sugar 1kg",      45, 100,  10),
            ("1007", "Tea 250g",      120,  40,   5),
            ("1008", "Cooking Oil 1L",160,  30,   5),
            ("1009", "Salt 1kg",       25, 200,  20),
            ("1010", "Atta 5kg",      240,  25,   5),
        ]
        cur.executemany(
            "INSERT INTO products (barcode, name, price, stock, minStock) VALUES (%s, %s, %s, %s, %s)",
            default_products,
        )

    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized successfully")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def authenticate(f):
    """JWT cookie authentication decorator."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("token")
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = decoded
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


def row_to_dict(cursor, row):
    """Convert a single DB row to a dict using cursor description."""
    if row is None:
        return None
    return {col[0]: val for col, val in zip(cursor.description, row)}


def rows_to_dicts(cursor, rows):
    """Convert all rows to a list of dicts."""
    cols = [col[0] for col in cursor.description]
    return [{c: v for c, v in zip(cols, r)} for r in rows]


# ---------------------------------------------------------------------------
# Auth Routes
# ---------------------------------------------------------------------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    age = data.get("age")
    mobile = data.get("mobile")
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT email FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User already exists"}), 400

        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        cur.execute(
            "INSERT INTO users (id, name, age, mobile, email, password) VALUES (%s, %s, %s, %s, %s, %s)",
            (str(uuid.uuid4()), name, age, mobile, email, hashed),
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"})
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        user = row_to_dict(cur, row)

        if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return jsonify({"error": "Invalid credentials"}), 400

        token = jwt.encode(
            {"id": user["id"], "email": user["email"], "name": user["name"],
             "exp": datetime.utcnow() + timedelta(days=1)},
            JWT_SECRET,
            algorithm="HS256",
        )
        resp = make_response(jsonify({"user": {"id": user["id"], "name": user["name"], "email": user["email"]}}))
        resp.set_cookie("token", token, httponly=True, secure=True, samesite="None")
        return resp
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    resp = make_response(jsonify({"message": "Logged out"}))
    resp.delete_cookie("token")
    return resp


@app.route("/api/auth/me", methods=["GET"])
@authenticate
def me():
    return jsonify({"user": request.user})


@app.route("/api/auth/change-password", methods=["POST"])
@authenticate
def change_password():
    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM users WHERE id = %s", (request.user["id"],))
        user = row_to_dict(cur, cur.fetchone())

        if not user or not bcrypt.checkpw(old_password.encode(), user["password"].encode()):
            return jsonify({"error": "Invalid old password"}), 400

        hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
        cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, request.user["id"]))
        conn.commit()
        return jsonify({"message": "Password changed successfully"})
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Stock / Product Routes
# ---------------------------------------------------------------------------

@app.route("/api/stock", methods=["GET"])
@authenticate
def get_stock():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM products")
        return jsonify(rows_to_dicts(cur, cur.fetchall()))
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/stock", methods=["POST"])
@authenticate
def add_product():
    data = request.get_json()
    barcode = data.get("barcode")
    name = data.get("name")
    price = data.get("price")
    stock = data.get("stock")
    min_stock = data.get("minStock", 10)

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT barcode FROM products WHERE barcode = %s", (barcode,))
        if cur.fetchone():
            return jsonify({"error": "Product with this barcode already exists"}), 400

        cur.execute(
            "INSERT INTO products (barcode, name, price, stock, minStock) VALUES (%s, %s, %s, %s, %s)",
            (barcode, name, float(price), int(stock), int(min_stock)),
        )
        conn.commit()
        return jsonify({"barcode": barcode, "name": name, "price": float(price),
                        "stock": int(stock), "minStock": int(min_stock)})
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/stock/<barcode>", methods=["PATCH"])
@authenticate
def update_stock(barcode):
    data = request.get_json()
    change = int(data.get("change", 0))

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM products WHERE barcode = %s", (barcode,))
        product = row_to_dict(cur, cur.fetchone())
        if not product:
            return jsonify({"error": "Product not found"}), 404

        new_stock = max(0, product["stock"] + change)
        cur.execute("UPDATE products SET stock = %s WHERE barcode = %s", (new_stock, barcode))
        conn.commit()
        product["stock"] = new_stock
        return jsonify(product)
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/products/<barcode>", methods=["GET"])
@authenticate
def get_product(barcode):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM products WHERE barcode = %s", (barcode,))
        product = row_to_dict(cur, cur.fetchone())
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product)
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Settings Routes
# ---------------------------------------------------------------------------

@app.route("/api/settings", methods=["GET"])
@authenticate
def get_settings():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM settings WHERE id = 1")
        row = row_to_dict(cur, cur.fetchone())
        return jsonify(row or {})
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/settings", methods=["PATCH"])
@authenticate
def update_settings():
    data = request.get_json()
    fields = ["storeName", "storeAddress", "storePhone", "gstNumber",
              "currency", "taxPercentage", "billHeader", "billFooter", "defaultLanguage"]

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE settings SET
                storeName        = COALESCE(%s, storeName),
                storeAddress     = COALESCE(%s, storeAddress),
                storePhone       = COALESCE(%s, storePhone),
                gstNumber        = COALESCE(%s, gstNumber),
                currency         = COALESCE(%s, currency),
                taxPercentage    = COALESCE(%s, taxPercentage),
                billHeader       = COALESCE(%s, billHeader),
                billFooter       = COALESCE(%s, billFooter),
                defaultLanguage  = COALESCE(%s, defaultLanguage)
            WHERE id = 1
        """, [data.get(f) for f in fields])
        conn.commit()

        cur.execute("SELECT * FROM settings WHERE id = 1")
        return jsonify(row_to_dict(cur, cur.fetchone()))
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Billing Route
# ---------------------------------------------------------------------------

@app.route("/api/billing", methods=["POST"])
@authenticate
def process_billing():
    data = request.get_json()
    items = data.get("items", [])
    customer_mobile = data.get("customerMobile")
    customer_name = data.get("customerName")
    payment_method = data.get("paymentMethod")
    language = data.get("language")

    conn = get_connection()
    cur = conn.cursor()
    try:
        conn.start_transaction()

        total_points = 0
        total_amount = 0.0

        for item in items:
            cur.execute("SELECT * FROM products WHERE barcode = %s", (item["barcode"],))
            product = row_to_dict(cur, cur.fetchone())
            if product:
                item_total = item["price"] * item["quantity"]
                total_amount += item_total
                total_points += int(item_total)

                new_stock = product["stock"] - item["quantity"]
                cur.execute("UPDATE products SET stock = %s WHERE barcode = %s",
                            (new_stock, item["barcode"]))

                if new_stock < 10:
                    delivery_time = (datetime.utcnow() + timedelta(hours=24)).isoformat()
                    cur.execute(
                        "INSERT INTO orders (id, barcode, name, quantity, status, deliveryTime) VALUES (%s, %s, %s, %s, %s, %s)",
                        (str(uuid.uuid4()), product["barcode"], product["name"], 50, "Ordered", delivery_time),
                    )
                    cur.execute(
                        "INSERT INTO notifications (id, message, date, type) VALUES (%s, %s, %s, %s)",
                        (str(uuid.uuid4()),
                         f"CRITICAL: {product['name']} stock is {new_stock}. Auto-ordered 50 units.",
                         datetime.utcnow().isoformat(), "critical"),
                    )
                elif new_stock < 20:
                    cur.execute(
                        "INSERT INTO notifications (id, message, date, type) VALUES (%s, %s, %s, %s)",
                        (str(uuid.uuid4()),
                         f"WARNING: {product['name']} stock is low ({new_stock} remaining).",
                         datetime.utcnow().isoformat(), "warning"),
                    )

        customer = None
        if customer_mobile:
            cur.execute("SELECT * FROM customers WHERE mobile = %s", (customer_mobile,))
            customer = row_to_dict(cur, cur.fetchone())

            if customer:
                new_points = customer["points"] + total_points
                new_lang = language or customer["language"]
                cur.execute(
                    "UPDATE customers SET points = %s, language = %s WHERE mobile = %s",
                    (new_points, new_lang, customer_mobile),
                )
                customer["points"] = new_points
                customer["language"] = new_lang
            else:
                customer = {
                    "mobile": customer_mobile,
                    "name": customer_name or "New Customer",
                    "points": total_points,
                    "language": language or "English",
                }
                cur.execute(
                    "INSERT INTO customers (mobile, name, points, language) VALUES (%s, %s, %s, %s)",
                    (customer["mobile"], customer["name"], customer["points"], customer["language"]),
                )

        txn = {
            "id": str(uuid.uuid4()),
            "items": json.dumps(items),
            "total": total_amount,
            "paymentMethod": payment_method,
            "customerMobile": customer_mobile,
            "date": datetime.utcnow().isoformat(),
            "status": "Paid" if payment_method == "online" else "Pending Cashier",
        }
        cur.execute(
            "INSERT INTO transactions (id, items, total, paymentMethod, customerMobile, date, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (txn["id"], txn["items"], txn["total"], txn["paymentMethod"],
             txn["customerMobile"], txn["date"], txn["status"]),
        )

        conn.commit()
        return jsonify({"transaction": {**txn, "items": items}, "customer": customer})
    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({"error": "Billing failed"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------

@app.route("/api/transactions", methods=["GET"])
@authenticate
def get_transactions():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM transactions ORDER BY date DESC")
        rows = rows_to_dicts(cur, cur.fetchall())
        for t in rows:
            try:
                t["items"] = json.loads(t["items"])
            except Exception:
                pass
        return jsonify(rows)
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------

@app.route("/api/customers", methods=["GET"])
@authenticate
def get_customers():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM customers")
        return jsonify(rows_to_dicts(cur, cur.fetchall()))
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/customers/<mobile>", methods=["GET"])
@authenticate
def get_customer(mobile):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM customers WHERE mobile = %s", (mobile,))
        customer = row_to_dict(cur, cur.fetchone())
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        return jsonify(customer)
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

@app.route("/api/notifications", methods=["GET"])
@authenticate
def get_notifications():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM notifications ORDER BY date DESC")
        return jsonify(rows_to_dicts(cur, cur.fetchall()))
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Warehouse / Orders
# ---------------------------------------------------------------------------

@app.route("/api/warehouse", methods=["GET"])
@authenticate
def get_warehouse():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM orders ORDER BY deliveryTime DESC")
        return jsonify(rows_to_dicts(cur, cur.fetchall()))
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    initialize_db()
    app.run(host="0.0.0.0", port=PORT, debug=os.getenv("NODE_ENV") != "production")
