"""
Script pour générer le Refresh Token Google Ads via OAuth2.
Lance ce script, connecte-toi avec ton compte Google, et copie le refresh token.
"""

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/adwords"]

CLIENT_CONFIG = {
    "installed": {
        "client_id": "YOUR_CLIENT_ID",
        "client_secret": "YOUR_CLIENT_SECRET",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost:8090"],
    }
}

def main():
    flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, scopes=SCOPES)
    credentials = flow.run_local_server(port=8090)

    print("\n" + "=" * 60)
    print("REFRESH TOKEN (copie cette valeur) :")
    print("=" * 60)
    print(credentials.refresh_token)
    print("=" * 60)

if __name__ == "__main__":
    main()
