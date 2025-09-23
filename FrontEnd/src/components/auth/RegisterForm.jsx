import { useState} from 'react';
import '../../Styles/Auth.css';
import { RegisterUser } from '../../scripts/Auth';

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [icon, setIcon] = useState('');
    const [error, setError] = useState('')

    async function VerifyRegister(e){
        const [message,result] = await RegisterUser(username,password,icon,e)
        if(result){
            onRegisterSuccess(result)
            onSwitchToLogin()
        }
        else{
            setError(message)
        }

    }

    

    return (
        <div className='auth-container'>
            <div className='auth-card'>
                <h2>Inscription</h2>
                <form onSubmit={(e) => VerifyRegister(e)}>
                    {error && <div className='error-message'>{error}</div>}

                    <div className='form-group'>
                        <label htmlFor='username'>Nom d'utilisateur</label>
                        <input 
                            type='text'
                            id='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='password'> Mot de passe</label>
                        <input 
                            type='password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                        <div className='form-group'>
                            <label htmlFor='icon'>Entrer votre Icon (max 2 caractères)</label>
                            <input
                                type='text'
                                id='icon'
                                value={icon}
                                onChange={(e) => setIcon(e.target.value.slice(0, 2))}
                                maxLength={2}
                                required
                            />
                        </div>

                        <div className='info-message'>
                            <p><strong>🔒 Sécurité renforcée :</strong></p>
                            <p>Après votre inscription, un fichier .secrets sera automatiquement téléchargé. 
                            Gardez-le en sécurité ! Vous en aurez besoin pour vous connecter avec la 2FA.</p>
                        </div>

                        <button type='submit' className='auth-button'>
                            S'inscrire
                        </button>
                </form>

                <div className='auth-footer'>
                    <p>Déjà un compte ?</p>
                    <button onClick={onSwitchToLogin} className='switch-button'>
                        Se connecter
                    </button>
                </div>
            </div>
        </div>
    );
}




