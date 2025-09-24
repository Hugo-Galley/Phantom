export default async function SendMessage(content, id_conversation, id_receiver,type){
    console.log("Le type que je vais enregsiterer dans API  est : ",type)
    try {
        console.log("Le contenu envoyé est : ",content)
        const response = await fetch("http://10.10.10.5:8000/conversation/addMessage",{
            method: 'POST',
            headers :{
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                id_receiver : id_receiver,
                content : content,
                dataType : type,
                id_conversation : id_conversation
            })
        })
        if (!response.ok){
            return false
        }
        const data = await response.json()

        if (data.succes === "true"){
            return data.id_message
        }
        else{
            console.error("Reponse invalide de l'API")
            return ""
        }
       
    } catch (error) {
        console.log("Erreur lors de l'envoie du message ", error)
        return false
    }
}
export async function CreateMessageInIndexed(receiver, content, id_message, id_conversation,type) {
    const sendAt = new Date().toISOString().split('.')[0].replace('T', ' ');
    
    return new Promise((resolve, reject) => {        
        let request = indexedDB.open("UserDB", 1);
        
        request.onerror = function(event) {
            console.error("Erreur lors de l'ouverture de la base de données", event.target.error);
            reject(event.target.error); 
        };

        request.onsuccess = function(event) {
            let db = event.target.result;
            
            if (!db.objectStoreNames.contains("Conversation")) {
                console.error("Le magasin d'objets 'Conversation' n'existe pas");
                reject(new Error("Le magasin d'objets 'Conversation' n'existe pas"));
                return;
            }

            let transaction = db.transaction("Conversation", "readwrite");
            let store = transaction.objectStore("Conversation");
            let getRequest = store.get(id_message);
            
            getRequest.onsuccess = function(event) {

                if (event.target.result) {
                    console.log("Message déjà existant:", id_message);
                    resolve(true);
                    return;
                }

                console.log("Ajout d'un nouveau message:", id_message);
                let message = {
                    id_message: id_message,
                    receiver: receiver,
                    content: content,
                    datetime: sendAt,
                    id_conversation: id_conversation,
                    icon : "icon",
                    dataType : type
                };
                
                let addRequest = store.add(message);
                
                addRequest.onsuccess = function() {
                    console.log("Message ajouté avec succès !");
                    resolve(true);
                };
                
                addRequest.onerror = function(event) {
                    console.error("Erreur lors de l'ajout du message:", event.target.error);
                    reject(event.target.error);
                };
            };
            
            getRequest.onerror = function(event) {
                reject(event.target.error);
            };
        };
    });
}

