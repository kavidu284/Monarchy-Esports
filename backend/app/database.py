import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    config = {
        "host": os.getenv("MYSQLHOST", "localhost"),
        "user": os.getenv("MYSQLUSER", "root"),
        "password": os.getenv("MYSQLPASSWORD", ""),
        "database": os.getenv("MYSQLDATABASE", "monarchy_esports"),
        "port": int(os.getenv("MYSQLPORT", 3306)),
    }

    ssl_ca = os.getenv("MYSQLSSLCA")

    if ssl_ca:
        config["ssl_ca"] = ssl_ca

    return mysql.connector.connect(**config)