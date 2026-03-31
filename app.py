from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

import hashlib
import hmac
import time

BOT_TOKEN = "YOUR_BOT_TOKEN"


@app.route("/telegram-login", methods=["POST"])
def telegram_login():

    data = request.json

    check_hash = data.pop("hash")

    # create data check string
    data_check = "\n".join([f"{k}={v}" for k,v in sorted(data.items())])

    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()

    hmac_hash = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()

    # verify
    if hmac_hash != check_hash:
        return jsonify({"status": "invalid"})

    # check time (optional)
    if time.time() - int(data["auth_date"]) > 86400:
        return jsonify({"status": "expired"})

    telegram_id = str(data["id"])

    conn = sqlite3.connect("referral.db")
    c = conn.cursor()

    # create user if not exists
    c.execute("SELECT * FROM users WHERE telegram=?", (telegram_id,))
    if not c.fetchone():
        ref_code = "USER" + telegram_id[-4:]

        c.execute("""
        INSERT INTO users (telegram, ref_code)
        VALUES (?, ?)
        """, (telegram_id, ref_code))

    conn.commit()
    conn.close()

    return jsonify({"status": "success"})
# =========================
# 🔥 DATABASE
# =========================

def init_db():
    conn = sqlite3.connect("referral.db")
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram TEXT UNIQUE,
        ref_code TEXT,
        referred_by TEXT,
        deposit REAL DEFAULT 0,
        wallet REAL DEFAULT 0,
        reward_given INTEGER DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()

init_db()


# =========================
# 🔥 REGISTER USER
# =========================

@app.route("/register", methods=["POST"])
def register():

    data = request.json
    telegram = data["telegram"]
    ref = data.get("ref")

    ref_code = "USER" + telegram[-4:]

    conn = sqlite3.connect("referral.db")
    c = conn.cursor()

    try:
        c.execute("""
        INSERT INTO users (telegram, ref_code, referred_by)
        VALUES (?, ?, ?)
        """, (telegram, ref_code, ref))
    except:
        return jsonify({"status": "exists"})

    conn.commit()
    conn.close()

    return jsonify({"status": "success", "ref_code": ref_code})


# =========================
# 🔥 DEPOSIT (IMPORTANT)
# =========================

@app.route("/deposit", methods=["POST"])
def deposit():

    data = request.json
    telegram = data["telegram"]
    amount = data["amount"]

    conn = sqlite3.connect("referral.db")
    c = conn.cursor()

    # update deposit
    c.execute("""
    UPDATE users SET deposit = deposit + ?
    WHERE telegram=?
    """, (amount, telegram))

    # get user
    c.execute("SELECT referred_by, reward_given FROM users WHERE telegram=?", (telegram,))
    user = c.fetchone()

    referred_by, reward_given = user

    # 🔥 GIVE REWARD AFTER ₹500
    if amount >= 500 and referred_by and reward_given == 0:

        # give ₹25 to new user
        c.execute("""
        UPDATE users SET wallet = wallet + 25, reward_given=1
        WHERE telegram=?
        """, (telegram,))

        # give ₹50 to referrer
        c.execute("""
        UPDATE users SET wallet = wallet + 50
        WHERE ref_code=?
        """, (referred_by,))

    conn.commit()
    conn.close()

    return jsonify({"status": "deposit_success"})


# =========================
# 🔥 GET USER
# =========================

@app.route("/user/<telegram>")
def get_user(telegram):

    conn = sqlite3.connect("referral.db")
    c = conn.cursor()

    c.execute("""
    SELECT wallet, ref_code FROM users WHERE telegram=?
    """, (telegram,))

    user = c.fetchone()

    conn.close()

    if not user:
        return jsonify({"error": "not found"})

    return jsonify({
        "wallet": user[0],
        "ref_code": user[1]
    })


if __name__ == "__main__":
    app.run(debug=True)