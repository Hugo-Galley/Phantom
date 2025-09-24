import '../Styles/PopupNewConversation.css'
import { useState, useEffect } from "react";
import getInformations from '../scripts/GetInformations';
import CreateConversation from '../scripts/Conversation';

export default function PopUpNewConversation({ onClose, idNewConversation }){
    const [listOfUSer, setListOfUser] = useState([])
    const [sortList, setSortList] = useState([])
    function sortUser(event, users){
        setSortList(listOfUSer)
        setSortList(users.filter(user => user.username.toLowerCase().includes(event.target.value.toLowerCase())))
    }
    useEffect(() => {
        async function fetchUsers(){
            try {
                const users = await getInformations("http://10.10.10.5:8000/users/all")
                setListOfUser(users)
                setSortList(users)
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs:", error)
            }
        }
        fetchUsers()
    }, [])
    async function CreateNewConversation(id_user){
        const idConversation = await CreateConversation(id_user)
        idNewConversation(idConversation)
        

    }
    return(
            <div className="popup-body">
                <div className="close-button-container">
                    <button className="close-button" onClick={onClose}>X</button>
                </div>
            <h3 className="popup-title">Nouveau Message</h3>
            <div className="popup-textInput">
                <p className="A">À :</p>
                <input placeholder="Rechercher" className="inputSearch"  onChange={() => sortUser(event,listOfUSer)}/>
            </div>
       
        <div className="popup-contact-list">
            <p className="popup-contact-list-title">Suggestions</p>
            {
                sortList.map((user,index) =>(
                    <button onClick={() => {CreateNewConversation(user.id_user); onClose();}} key={index} className="contact-item">
                        <p className="popup-contact-list-icon">{user.icon}</p>
                        <p className="popup-contact-list-name">{user.username}</p>
                    </button>
                ))
            }
        </div>
            </div>
    )
}