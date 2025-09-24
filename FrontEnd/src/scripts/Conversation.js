export default async function CreateConversation(id_user){
    const storedUser = localStorage.getItem("user")
    const myid = storedUser ? JSON.parse(storedUser).id : ""

    const response = await fetch("http://10.10.10.5:8000/conversation/new", {
        method : 'POST',
        headers : {
             'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
            id_user1 : myid,
            id_user2 : id_user
    })
    })
    if (!response.ok){
        console.error("Erreur lors de la création d'une conversation")
    }
    const data = await response.json()
    
    if (data.succes === "true"){
        return data.id_conversation
    }
    else{
        return ""
    }

}

export async function GetConversationInfo(id_conversation){
    const storedUser = localStorage.getItem("user")
    const myid = storedUser ? JSON.parse(storedUser).id : ""

    const response = await fetch("http://10.10.10.5:8000/conversation/info", {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
            id_conversation : id_conversation
        })
    })
    if (!response.ok){
        return false
    }
    const data = await response.json()
    if(data){
        let dico =  {
            "name" : data.name,
            "icon" : data.icon,
            "myId" : myid,
            "herId" : "",
            "id_conversation" : data.id_conversation
        }
        if (data.id_user1 === myid){
            dico.herId = data.id_user2
        }
        else{
            dico.herId = data.id_user1
        }
        return dico
    }
}
export async function GetInternMessageList(id_conversation){
    const storedUser = localStorage.getItem("user")
    const myid = storedUser ? JSON.parse(storedUser).id : ""
    let msgList = [];
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("UserDB", 1);

        request.onerror = function(event){
            console.error("Erreur lors de l'ouverture de la base de données ", event.target.error);
            reject([]);
        };

        request.onsuccess = function(event){
            let db = event.target.result
            try{
                let transaction = db.transaction("Conversation", "readwrite");
                let store = transaction.objectStore("Conversation");
                let requestMessageList = store.getAll()

                requestMessageList.onerror = function(event){
                    console.error("Erreur lors de la récupération de la liste de message ",event.target.error)
                    reject([])
                }
                requestMessageList.onsuccess = function(event){
                    let result = event.target.result
                    for (let i = 0; i < result.length; i++) {
                        if(result[i].id_conversation === id_conversation){
                            if(result[i].receiver === myid){
                                result[i].type = "received"
                            }
                            else{
                                result[i].type = "sent"
                            }
                            msgList.push(result[i])
                        }
                    }
                    msgList.sort((a,b) => new Date(a.datetime) - new Date(b.datetime))
                    resolve(msgList)
                }
                
            }
            catch(error){
                console.error("Erreur lors de la récupération des messages", error)
                reject([])
            }
        }
    })
}

export async function DeleteConversation(conversationId,selectedConversation,setSelectedConversation,setRefreshTrigger){
    try {
      const response = await fetch(`http://10.10.10.5:8000/conversation/${conversationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (conversationId === selectedConversation) {
          setSelectedConversation("");
        }

        setRefreshTrigger(prev => prev + 1);
        
        return true;
      } else {
        console.error("Erreur lors de la suppression:", data.message);
        alert("Échec de la suppression de la conversation");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Échec de la suppression de la conversation");
      return false;
    }
  };