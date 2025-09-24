import ConversationCard from "./ConversationCard";
import '../Styles/ConversationBar.css'
import { useState, useEffect } from 'react';
import PopUpNewConversation from "./PopUpNewConversation";
import {GetConversationsBar} from "../scripts/GetInformations";

export default function ConversationBar({ userData, onLogout, onsSelectedConversations, activeConversationId, onDeleteConversation, refreshTrigger }) {
    const [showPopUp, setShowPopUp] = useState(false);
    const [listOfConversation, setListOfConversation] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [isempty, setIsempty] = useState(false)

    function sortConversation(event, conversations) {
        setSortList(listOfConversation);
        setSortList(conversations.filter(conversation => conversation.name.toLowerCase().includes(event.target.value.toLowerCase())));
    }

    function handleNewConversation(conversationId){
        onsSelectedConversations(conversationId)
        fetchConversations();
    }
    async function fetchConversations() {            
        try {
            const conversations = await GetConversationsBar(`http://10.10.10.5:8000/conversation/allOfUser?id_user=${userData.id}`);
            const conversationTableau = Array.isArray(conversations) ? conversations : []
            if (conversationTableau === "empty" || !conversations || conversations.length === 0) {
                setIsempty(true)
            } else {
                setIsempty(false)
            }
            setListOfConversation(conversationTableau);
            setSortList(conversationTableau);

        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        }
    }
    useEffect(() => {
        fetchConversations();
    }, [userData, refreshTrigger]);

    return (
        <div className="ConversationBar-container">
                        <div className="user-profile">
                <div className="user-info">
                    <div className="user-avatar">{userData.icon}</div>
                    <div className="user-name">{userData.username}</div>
                </div>
                <button className="logout-button" onClick={onLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                    </svg>
                </button>
            </div>
            <div className="searchbar-head">
                <input
                    placeholder="Rechercher une conversation"
                    className="input-conv"
                    onChange={() => sortConversation(event, listOfConversation)}
                />
                <button className="new-conv-button" onClick={() => setShowPopUp(true)} style={{ cursor: 'pointer', background: 'transparent' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                    </svg>
                </button>
            </div>

            {showPopUp && (
                <div className="overlay">
                    <div className="popup-new-conversation">
                        <PopUpNewConversation
                         onClose={() => setShowPopUp(false)} 
                         idNewConversation={handleNewConversation}
                         />
                    </div>
                </div>
            )}

            <div className="conversationBar-body">
                {!isempty? (
                    sortList.map((convCard, index) => (
                        <div onClick={() => onsSelectedConversations(convCard.id_conversation)}
                            key={index} 
                            className={`conversation-items ${convCard.id_conversation === activeConversationId ? 'active' : ''}`}>
                            <ConversationCard
                                key={index}
                                icon={convCard.icon}
                                title={convCard.name}
                                LastMessagedate={convCard.lastMessageDate}
                                body={convCard.body}
                                onDelete={() => {
                                    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
                                        onDeleteConversation(convCard.id_conversation);
                                    }
                                }} />
                        </div>
                    ))
                ) : (
                    <div className="no-conversations">
                        <p>Aucune conversation</p>
                        <button className="start-chat-button" onClick={() => setShowPopUp(true)}>
                            Démarrer une nouvelle conversation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}