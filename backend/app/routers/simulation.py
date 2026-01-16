from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class GPSLocation(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None


class GeofenceEvent(BaseModel):
    location: GPSLocation
    event_type: str = "arrival"  # arrival, departure


class PushNotification(BaseModel):
    title: str
    body: str
    app_name: Optional[str] = None


class SimulationResponse(BaseModel):
    success: bool
    message: str
    timestamp: datetime
    data: Optional[dict] = None


# Simulated geofence locations
PRESET_LOCATIONS = {
    "home": GPSLocation(latitude=35.6812, longitude=139.7671, name="自宅"),
    "office": GPSLocation(latitude=35.6895, longitude=139.6917, name="オフィス"),
    "station": GPSLocation(latitude=35.6814, longitude=139.7670, name="東京駅"),
    "convenience_store": GPSLocation(latitude=35.6850, longitude=139.7700, name="コンビニ"),
}


@router.get("/locations")
async def get_preset_locations():
    """Get list of preset locations for simulation"""
    return PRESET_LOCATIONS


@router.post("/geofence/trigger")
async def trigger_geofence(event: GeofenceEvent):
    """Simulate geofence trigger event"""
    location_name = event.location.name or f"({event.location.latitude}, {event.location.longitude})"

    # This would trigger the VAPI assistant to acknowledge the location
    response_message = f"ジオフェンスイベント: {location_name}に{'到着' if event.event_type == 'arrival' else '出発'}しました。"

    return SimulationResponse(
        success=True,
        message=response_message,
        timestamp=datetime.now(),
        data={
            "location": event.location.model_dump(),
            "event_type": event.event_type,
            "trigger_message": response_message,
        },
    )


@router.post("/notification/receive")
async def receive_notification(notification: PushNotification):
    """Simulate receiving a push notification"""
    # This would trigger the VAPI assistant to read the notification
    app_prefix = f"{notification.app_name}からの通知: " if notification.app_name else "通知: "

    response_message = f"{app_prefix}{notification.title}。{notification.body}"

    return SimulationResponse(
        success=True,
        message="通知を受信しました",
        timestamp=datetime.now(),
        data={
            "notification": notification.model_dump(),
            "read_text": response_message,
        },
    )


@router.post("/geofence/preset/{location_key}")
async def trigger_preset_geofence(location_key: str, event_type: str = "arrival"):
    """Trigger geofence for a preset location"""
    if location_key not in PRESET_LOCATIONS:
        return SimulationResponse(
            success=False,
            message=f"Unknown location: {location_key}",
            timestamp=datetime.now(),
        )

    location = PRESET_LOCATIONS[location_key]
    event = GeofenceEvent(location=location, event_type=event_type)

    return await trigger_geofence(event)
