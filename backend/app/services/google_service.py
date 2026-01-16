from typing import Optional, List, Dict, Any
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from app.config import get_settings


class GoogleService:
    """Service for Google Calendar and Docs integration"""

    SCOPES = [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive.file",
    ]

    def __init__(self):
        self.settings = get_settings()
        self._credentials: Optional[Credentials] = None

    def get_auth_url(self, redirect_uri: str) -> str:
        """Get OAuth authorization URL"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.settings.google_client_id,
                    "client_secret": self.settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.SCOPES,
            redirect_uri=redirect_uri,
        )
        auth_url, _ = flow.authorization_url(prompt="consent")
        return auth_url

    def exchange_code(self, code: str, redirect_uri: str) -> Credentials:
        """Exchange authorization code for credentials"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.settings.google_client_id,
                    "client_secret": self.settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.SCOPES,
            redirect_uri=redirect_uri,
        )
        flow.fetch_token(code=code)
        self._credentials = flow.credentials
        return self._credentials

    def set_credentials(self, credentials: Credentials):
        """Set credentials directly"""
        self._credentials = credentials

    # Calendar methods
    async def get_calendar_events(
        self,
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        max_results: int = 10,
    ) -> List[Dict[str, Any]]:
        """Get calendar events"""
        if not self._credentials:
            raise ValueError("Not authenticated with Google")

        service = build("calendar", "v3", credentials=self._credentials)

        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=time_min.isoformat() + "Z" if time_min else None,
                timeMax=time_max.isoformat() + "Z" if time_max else None,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        return events_result.get("items", [])

    async def create_calendar_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a calendar event"""
        if not self._credentials:
            raise ValueError("Not authenticated with Google")

        service = build("calendar", "v3", credentials=self._credentials)

        event = {
            "summary": summary,
            "start": {"dateTime": start_time.isoformat(), "timeZone": "Asia/Tokyo"},
            "end": {"dateTime": end_time.isoformat(), "timeZone": "Asia/Tokyo"},
        }

        if description:
            event["description"] = description
        if location:
            event["location"] = location

        result = service.events().insert(calendarId="primary", body=event).execute()
        return result

    async def delete_calendar_event(self, event_id: str) -> bool:
        """Delete a calendar event"""
        if not self._credentials:
            raise ValueError("Not authenticated with Google")

        service = build("calendar", "v3", credentials=self._credentials)
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        return True

    # Docs methods
    async def create_document(
        self,
        title: str,
        content: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a Google Doc"""
        if not self._credentials:
            raise ValueError("Not authenticated with Google")

        docs_service = build("docs", "v1", credentials=self._credentials)

        document = docs_service.documents().create(body={"title": title}).execute()
        doc_id = document.get("documentId")

        if content:
            requests = [
                {
                    "insertText": {
                        "location": {"index": 1},
                        "text": content,
                    }
                }
            ]
            docs_service.documents().batchUpdate(
                documentId=doc_id, body={"requests": requests}
            ).execute()

        return {
            "id": doc_id,
            "title": title,
            "url": f"https://docs.google.com/document/d/{doc_id}/edit",
        }

    async def get_document(self, doc_id: str) -> Dict[str, Any]:
        """Get a Google Doc"""
        if not self._credentials:
            raise ValueError("Not authenticated with Google")

        docs_service = build("docs", "v1", credentials=self._credentials)
        document = docs_service.documents().get(documentId=doc_id).execute()

        # Extract text content
        content = ""
        for element in document.get("body", {}).get("content", []):
            if "paragraph" in element:
                for text_run in element["paragraph"].get("elements", []):
                    if "textRun" in text_run:
                        content += text_run["textRun"].get("content", "")

        return {
            "id": doc_id,
            "title": document.get("title", ""),
            "content": content,
            "url": f"https://docs.google.com/document/d/{doc_id}/edit",
        }

    async def update_document(self, doc_id: str, content: str) -> bool:
        """Update a Google Doc (append content)"""
        if not self._credentials:
            raise ValueError("Not authenticated with Google")

        docs_service = build("docs", "v1", credentials=self._credentials)

        # Get current document length
        document = docs_service.documents().get(documentId=doc_id).execute()
        end_index = document.get("body", {}).get("content", [{}])[-1].get("endIndex", 1)

        requests = [
            {
                "insertText": {
                    "location": {"index": end_index - 1},
                    "text": content,
                }
            }
        ]

        docs_service.documents().batchUpdate(
            documentId=doc_id, body={"requests": requests}
        ).execute()

        return True


google_service = GoogleService()
