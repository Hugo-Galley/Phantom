export default async function generateKeyPair(){
    let keyPair = await window.crypto.subtle.generateKey(
        {
            name : "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt","decrypt"]
    )
    let exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey)
    let exportedPrivate = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

   
    function convertToBase64(buffer){
        let binary = String.fromCharCode(...new Uint8Array(buffer))
        return btoa(binary)
    }
    let exportedPublicKey = `-----BEGIN PUBLIC KEY-----\n${convertToBase64(exportedPublic)}\n-----END PUBLIC KEY-----`;
    let exportedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${convertToBase64(exportedPrivate)}\n-----END PRIVATE KEY-----`;



    return [exportedPublicKey, exportedPrivateKey];
}


export async function CreateUserInIndexeed(username) {
    const [publicKey, privateKey] = await generateKeyPair();
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("UserDB", 1);
        
        
        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            if(!db.objectStoreNames.contains("User")){
                db.createObjectStore("User", { keyPath: "username" });
            }
            if (!db.objectStoreNames.contains("Conversation")) {
                db.createObjectStore("Conversation", { keyPath: "id_message" });
                console.log("Le magasin d'objets 'Conversation' a été créé.");
            }
        };
        
        request.onerror = function(event) {
            console.error("Erreur lors de l'ouverture de la base de données", event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            let db = event.target.result;
            try {
                let user = { 
                    username: username, 
                    privateKey: privateKey 
                };
                
                let transaction = db.transaction("User", "readwrite");
                let store = transaction.objectStore("User");
                let addRequest = store.add(user);
                
                addRequest.onsuccess = function() {
                    console.log("Utilisateur ajouté avec succès !");
                    resolve(publicKey)
                };
                
                addRequest.onerror = function(event) {
                    console.error("Erreur lors de l'ajout de l'utilisateur:", event.target.error);
                };
            }
            catch (error) {
                console.error("Erreur lors de l'ajout du User", error);
            }
        };
    });
}
