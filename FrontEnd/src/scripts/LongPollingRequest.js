import { GetInternMessageList } from "./Conversation"
import { CreateMessageInIndexed } from "./SendMessage"
import DecryptMessage from "./DecryptMessage"
export default async function LongPollingrequest(id_conversation,myId,lastMessageDate,setMessage, isActive = true){
    
    if(!isActive){
        console.log("Fin de la Long polling pour la conversation ",id_conversation)
        return
    }
    
    try{
        const response = await fetch("http://10.10.10.5:8000/conversation/allMessage", {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                id_conversation : id_conversation,
                myId : myId,
                lastMessageDate : lastMessageDate
            })
        })
    
        if(response.status === 200){
            const data = await response.json()
            if (data.length > 0){
                for (let message of data){
                    try {
                        const decryptContent = await DecryptMessage(message.content,message.nonce,message.encryptedAesKey)
                        await CreateMessageInIndexed(
                            message.id_receiver,
                            decryptContent, 
                            message.id_message,
                            message.id_conversation,
                            message.dataType 
                        )
                    }
                    catch(error){
                        if(!error.message.includes("Key already exists")){
                            console.error("Erreur IndexDb ", error)
                        }
                    }
                }
                const lastDate = data[data.length -1].sendAt
                lastMessageDate =lastDate

                const updateMessageList = await GetInternMessageList(id_conversation)
                setMessage(updateMessageList)
               
                
            }

            setTimeout(500)
            await LongPollingrequest(id_conversation,myId,lastMessageDate,setMessage,isActive)
        }
        else{
            setTimeout(1000)
            await LongPollingrequest(id_conversation,myId,lastMessageDate,setMessage,isActive)
        
        }
    }
    catch(error){
        console.error("Erreur de long polling ",error)
        setTimeout(2000)
        await LongPollingrequest(id_conversation,myId,lastMessageDate,setMessage,isActive)
    }
    

}