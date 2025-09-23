import logging
from models import Users
from fastapi import APIRouter
from config import db
import uuid
from cryptography.hazmat.primitives import hashes
import base64
from Class.api_class_body import AuthRequest, GetUserRequest, RegisterUser, GetAllOfUser, VerifySecretRequest
import os


router = APIRouter()

@router.post("/users/")
async def get_users(get_user : GetUserRequest):
    logging.debug(f"L'id récuperé est {get_user.username}")
    userData = db.query(Users).filter(Users.username == get_user.username).first()
    if userData:
        return {"id" : userData.id_user, "username": userData.username, "password" : userData.password, "publicKey" : userData.public_key, "salt" : userData.salt, "icon" : userData.icon}
    else:
        logging.error("L'utilisateur n'existe pas")
        return {"message" : "L'utilisateur demande n'existe pas"}

@router.post("/users/auth/")
async def auth_user(auth_data : AuthRequest):
    userData = db.query(Users).filter(Users.username == auth_data.username).first()
    if userData:
        auth_data.password += userData.salt
        digest = hashes.Hash(hashes.SHA256())
        digest.update(auth_data.password.encode())
        password = base64.b64encode(digest.finalize()).decode('utf-8')
        if password == userData.password:
            return {"authorize" : "true"}
        else:
            return {"authorize" : "false"}
    else:
        return {"message" : "L'utilisateur n'existe pas", "authorize": "false"}

@router.post("/users/register")
async def post_user(auth_data : RegisterUser):
    logging.info(auth_data)
    try:
        ifExistsUserData = db.query(Users).filter(Users.username == auth_data.username).first()
        if ifExistsUserData:
            return {"Message" : "Un utilisateur existe déja avec se nom d'utilisateur", "exists" : "true"}
        
        # Génération du salt pour le mot de passe
        password_salt = base64.b64encode(os.urandom(16)).decode('utf-8')
        password = auth_data.password + password_salt
        digest = hashes.Hash(hashes.SHA256())
        digest.update(password.encode())
        password = base64.b64encode(digest.finalize()).decode('utf-8')
        
        # Génération du salt pour la 2FA
        twofa_salt_bytes = os.urandom(16)
        twofa_salt = ''.join(format(x, '02x') for x in twofa_salt_bytes)  # Hex format pour le salt 2FA
        
        # Génération du secret 2FA
        combined_data = auth_data.username + auth_data.password + twofa_salt + "PHANTOM_2FA_2024"
        secret_digest = hashes.Hash(hashes.SHA256())
        secret_digest.update(combined_data.encode())
        secret_hash = secret_digest.finalize()
        
        # Conversion en Base32 pour le secret
        base32_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
        secret = ''
        for i in range(32):
            secret += base32_chars[secret_hash[i] % 32]
        
        # Génération du hash de vérification avec le salt 2FA
        verify_combined_data = auth_data.username + auth_data.password + twofa_salt + "PHANTOM_VERIFICATION"
        verify_digest = hashes.Hash(hashes.SHA256())
        verify_digest.update(verify_combined_data.encode())
        verification_hash = base64.b64encode(verify_digest.finalize()).decode('utf-8')
        
        newUser = Users(id_user=str(uuid.uuid4()),
                               username=auth_data.username,
                               password=password,
                               public_key=auth_data.publicKey,
                               salt=password_salt,
                               icon=auth_data.icon,
                               verification_hash=verification_hash)
        db.add(newUser)
        db.commit()
        return {
            "Message" : f"User {auth_data.username} crée avec succées", 
            "exists" : "false",
            "twofa_salt": twofa_salt,
            "secret": secret
        }
    except Exception as e:
        logging.error(f"Erreur : {e}")
        return {"Message" : "Erreur lor de la création du User", "exists" : "false"}

@router.post("/users/all")
async def get_all_user(get_user : GetAllOfUser):
    usersData = (db.query(Users)
                 .with_entities(Users.id_user, Users.username, Users.icon)
                 .filter(Users.id_user != get_user.myId)
                 .all())
    return [{"id_user" : user[0], "username" : user[1], "icon" : user[2]} for user in usersData]

@router.post("/users/verify-secret/")
async def verify_secret(verify_data: VerifySecretRequest):
    """Vérifie si le secret 2FA est valide pour cet utilisateur"""
    try:
        userData = db.query(Users).filter(Users.username == verify_data.username).first()
        if not userData:
            return {"valid": False, "message": "Utilisateur non trouvé"}
        
        # Générer le hash de vérification avec les données fournies
        combined_data = verify_data.username + verify_data.password + verify_data.salt + "PHANTOM_VERIFICATION"
        digest = hashes.Hash(hashes.SHA256())
        digest.update(combined_data.encode())
        verification_hash = base64.b64encode(digest.finalize()).decode('utf-8')
        
        # Comparer avec le hash stocké
        if verification_hash == userData.verification_hash:
            return {"valid": True, "message": "Secret valide"}
        else:
            return {"valid": False, "message": "Secret invalide"}
            
    except Exception as e:
        logging.error(f"Erreur lors de la vérification du secret : {e}")
        return {"valid": False, "message": "Erreur lors de la vérification"}
