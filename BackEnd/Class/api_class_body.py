from pydantic import BaseModel

class AuthRequest(BaseModel):
    username : str
    password : str

class GetUserRequest(BaseModel):
    username : str

class GetAllOfUser(BaseModel):
    myId : str
class RegisterUser(BaseModel):
    username : str
    password : str
    icon : str
    publicKey : str

class VerifySecretRequest(BaseModel):
    username : str
    password : str
    salt : str
class CreateNewConversation(BaseModel):
    id_user1 : str
    id_user2 : str
class AddMessageToConversation(BaseModel):
    id_receiver : str
    content : str
    id_conversation : str
    dataType : str
class GetAllConversationForUser(BaseModel):
    id_user : str

class GetConversationInfo(BaseModel):
    id_conversation : str
class GetMessageOfConversation(BaseModel):
    id_conversation : str
    myId : str
    lastMessageDate : str