from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from bson import ObjectId

load_dotenv()

mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is not set")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'ebrokercrm')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str = "agent"

class UserLogin(BaseModel):
    identifier: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    property_type: str
    bhk: str
    furnishing: str
    rent: str
    deposit: str
    tenant_type: str
    possession: str
    building: str
    location: str
    agent_name: str
    agent_contact: str
    images: List[str] = []
    description: Optional[str] = None

class Property(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str
    property_type: str
    bhk: str
    furnishing: str
    rent: str
    deposit: str
    tenant_type: str
    possession: str
    building: str
    location: str
    agent_name: str
    agent_contact: str
    images: List[str] = []
    description: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None

class LeadCreate(BaseModel):
    property_id: str
    client_name: str
    client_phone: str
    requirements: str

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    agent_id: str
    client_name: str
    client_phone: str
    requirements: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WhatsAppMessageRequest(BaseModel):
    property_id: str

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    if user_data.role != "agent":
        raise HTTPException(status_code=403, detail="Only agents can register through this endpoint")
    
    existing_user = await db.users.find_one(
        {"$or": [{"email": user_data.email}, {"phone": user_data.phone}]},
        {"_id": 0}
    )
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role="agent"
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token(data={"sub": user.id, "role": user.role})
    
    return {
        "user": user.model_dump(),
        "token": token
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one(
        {"$or": [{"email": login_data.identifier}, {"phone": login_data.identifier}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user['id'], "role": user['role']})
    
    user_response = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return {
        "user": user_response,
        "token": token
    }

@api_router.post("/auth/register-admin")
async def register_admin(user_data: UserRegister):
    existing_admin = await db.users.find_one(
        {"role": "admin"},
        {"_id": 0}
    )
    
    if existing_admin:
        raise HTTPException(status_code=403, detail="An admin already exists. Only one admin is allowed.")
    
    existing_user = await db.users.find_one(
        {"$or": [{"email": user_data.email}, {"phone": user_data.phone}]},
        {"_id": 0}
    )
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role="admin"
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token(data={"sub": user.id, "role": user.role})
    
    return {
        "user": user.model_dump(),
        "token": token
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/properties")
async def create_property(property_data: PropertyCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'agent':
        raise HTTPException(status_code=403, detail="Only agents can create properties")
    
    property_obj = Property(
        agent_id=current_user['id'],
        **property_data.model_dump()
    )
    
    property_dict = property_obj.model_dump()
    property_dict['created_at'] = property_dict['created_at'].isoformat()
    
    await db.properties.insert_one(property_dict)
    
    return property_obj

@api_router.get("/properties")
async def get_properties(status_filter: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    
    if current_user['role'] == 'agent':
        if status_filter:
            query = {"agent_id": current_user['id'], "status": status_filter}
        else:
            query = {"agent_id": current_user['id']}
    else:
        if status_filter:
            query = {"status": status_filter}
    
    properties = await db.properties.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    
    return properties

@api_router.get("/properties/approved")
async def get_approved_properties(current_user: dict = Depends(get_current_user)):
    properties = await db.properties.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    
    return properties

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str, current_user: dict = Depends(get_current_user)):
    property_data = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if current_user['role'] == 'agent' and property_data['agent_id'] != current_user['id']:
        if property_data['status'] != 'approved':
            raise HTTPException(status_code=403, detail="Access denied")
    
    return property_data

@api_router.post("/properties/{property_id}/approve")
async def approve_property(property_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can approve properties")
    
    result = await db.properties.update_one(
        {"id": property_id},
        {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property approved successfully"}

@api_router.post("/properties/{property_id}/reject")
async def reject_property(property_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can reject properties")
    
    result = await db.properties.update_one(
        {"id": property_id},
        {"$set": {"status": "rejected"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property rejected successfully"}

@api_router.post("/leads")
async def create_lead(lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    property_data = await db.properties.find_one({"id": lead_data.property_id}, {"_id": 0})
    
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    
    lead = Lead(
        property_id=lead_data.property_id,
        agent_id=property_data['agent_id'],
        client_name=lead_data.client_name,
        client_phone=lead_data.client_phone,
        requirements=lead_data.requirements
    )
    
    lead_dict = lead.model_dump()
    lead_dict['created_at'] = lead_dict['created_at'].isoformat()
    
    await db.leads.insert_one(lead_dict)
    
    return lead

@api_router.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    query = {}
    
    if current_user['role'] == 'agent':
        query = {"agent_id": current_user['id']}
    
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    
    return leads

@api_router.post("/whatsapp/generate-message")
async def generate_whatsapp_message(request: WhatsAppMessageRequest, current_user: dict = Depends(get_current_user)):
    property_data = await db.properties.find_one({"id": request.property_id}, {"_id": 0})
    
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    
    import urllib.parse
    
    nl = "\n"
    
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    property_link = f"{frontend_url}/properties/{request.property_id}"
    
    message_parts = [
        f"🏢 PROPERTY DETAILS",
        f"",
        f"🛏️ BHK: {property_data['bhk']}",
        f"🏠 Type: {property_data['property_type']}",
        f"💰 Rent: Rs {property_data['rent']}",
        f"📍 Location: {property_data['location']}",
        f"",
        f"👤 Agent: {property_data['agent_name']}",
        f"📞 Phone: {property_data['agent_contact']}",
        f"",
        f"🔗 View Full Details & Images:",
        f"{property_link}",
        f"",
        f"✨ Shared via EstateFlow CRM"
    ]
    
    message = nl.join(message_parts)
    
    encoded_message = urllib.parse.quote_plus(message)
    whatsapp_url = f"https://wa.me/?text={encoded_message}"
    
    return {
        "message": message,
        "whatsapp_url": whatsapp_url
    }

@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'agent':
        total_properties = await db.properties.count_documents({"agent_id": current_user['id']})
        approved_properties = await db.properties.count_documents({"agent_id": current_user['id'], "status": "approved"})
        pending_properties = await db.properties.count_documents({"agent_id": current_user['id'], "status": "pending"})
        total_leads = await db.leads.count_documents({"agent_id": current_user['id']})
        
        return {
            "total_properties": total_properties,
            "approved_properties": approved_properties,
            "pending_properties": pending_properties,
            "total_leads": total_leads
        }
    else:
        total_properties = await db.properties.count_documents({})
        approved_properties = await db.properties.count_documents({"status": "approved"})
        pending_properties = await db.properties.count_documents({"status": "pending"})
        total_agents = await db.users.count_documents({"role": "agent"})
        
        return {
            "total_properties": total_properties,
            "approved_properties": approved_properties,
            "pending_properties": pending_properties,
            "total_agents": total_agents
        }

@api_router.get("/admin/agents")
async def get_agents(current_user: dict = Depends(get_current_user), search: str = ""):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    search_query = {"role": "agent"}
    
    if search:
        search_query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    agents = await db.users.find(search_query, {"_id": 0, "password_hash": 0}).to_list(None)
    
    agents_with_counts = []
    for agent in agents:
        property_count = await db.properties.count_documents({"agent_id": agent['id']})
        pending_count = await db.properties.count_documents({"agent_id": agent['id'], "status": "pending"})
        approved_count = await db.properties.count_documents({"agent_id": agent['id'], "status": "approved"})
        
        agents_with_counts.append({
            "id": agent['id'],
            "name": agent['name'],
            "email": agent['email'],
            "phone": agent['phone'],
            "created_at": agent['created_at'],
            "total_properties": property_count,
            "pending_properties": pending_count,
            "approved_properties": approved_count
        })
    
    return agents_with_counts

@api_router.get("/admin/agents/{agent_id}/properties")
async def get_agent_properties(agent_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    agent = await db.users.find_one({"id": agent_id, "role": "agent"}, {"_id": 0})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    properties = await db.properties.find({"agent_id": agent_id}, {"_id": 0}).to_list(None)
    
    return {
        "agent": agent,
        "properties": properties
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
