import { CreateUserInIndexeed } from "./CreateUserInIndexed"
import { generateSecretKey, downloadSecretsFile, storeSecretKeyTemporary, validateSecretsFile, generateVerificationCode, verifyCode, getStoredSecretKey, generateVerificationHash } from "./2FA"

// Fonction de connexion avec 2FA OBLIGATOIRE (remplace l'ancienne fonction LoginUser)
export default async function LoginUser(username, password, secretsFile, event) {
    return await LoginUserWith2FA(username, password, secretsFile, event);
}

// Nouvelle fonction pour l'authentification avec 2FA OBLIGATOIRE
export async function LoginUserWith2FA(username, password, secretsFile, event) {
    event.preventDefault()
    
    try {
        // 1. Valider le fichier .secrets
        const secretsData = await validateSecretsFile(secretsFile, username);
        
        // 2. Vérifier le secret avec le serveur
        const verifyResponse = await fetch("http://localhost:8000/users/verify-secret", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                salt: secretsData.salt
            })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.valid) {
            throw new Error("Fichier .secrets invalide pour cet utilisateur ou mot de passe incorrect");
        }
        
        // 3. Procéder avec l'authentification normale seulement si le secret est valide
        const response = await fetch("http://localhost:8000/users/auth", {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                username,
                password
            }),
        })
        const data = await response.json()

        if (data.authorize === "true"){
            console.log("Authentification réussie avec 2FA")
            
            // Stocker temporairement la clé secrète pour la session
            storeSecretKeyTemporary(secretsData.secret);
            
            const userRequest = await fetch("http://localhost:8000/users/", {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    username
                })
            })
            const userData = await userRequest.json()

            localStorage.setItem(
                'user',
                JSON.stringify({
                    id : userData.id,
                    username : userData.username,
                    icon : userData.icon,
                    has2FA : true
                })
            )
            return userData
        }
        else{
            console.error("Authentification échouée")
            return false
        }

    } catch (error) {
        console.error("Erreur lors de l'authentification avec 2FA : ", error)
        throw error;
    }
}

export async function RegisterUser(username, password, icon, event ){
    event.preventDefault()
    try {
        const publicKey = await CreateUserInIndexeed(username)
        console.log("Clé public vaux ", publicKey)
        
        console.log("envoie de la requete")
        const response = await fetch("http://localhost:8000/users/register", {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                username,
                password,
                publicKey,
                icon
            }),
        })
        console.log("Reponse ", response.status)
        const data = await response.json()
        console.log("donnée recu ",data)

        if (data.exist === "true"){
            return ["L'utilisateur existe déjà",false]
        }
        else if (data.twofa_salt && data.secret) {
            // Téléchargement du fichier .secrets avec les données du serveur
            downloadSecretsFile(username, data.secret, data.twofa_salt);
            
            // Stockage temporaire pour la session
            storeSecretKeyTemporary(data.secret);
            
            return ["Inscription réussie ! Votre fichier .secrets a été téléchargé. Gardez-le en sécurité pour vous connecter.", true]
        }
        else {
            return ["Erreur lors de l'inscription", false]
        }


    } catch (error) {
        console.error("Erreur de l'authtification d'un utilisateur : ", error)
    }
}