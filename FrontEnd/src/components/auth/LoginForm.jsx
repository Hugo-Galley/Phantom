import { useState } from 'react';
import LoginUser from '../../scripts/Auth';
import '../../Styles/Auth.css';

export default function LoginForm({ onSwitchToRegister, loginSucces}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [secretsFile, setSecretsFile] = useState(null);
    const [error, setError] = useState('');

    async function VerifySucces(e){
        e.preventDefault()
        console.log("On vérifie le succès")
        
        if (!secretsFile) {
            setError("Veuillez sélectionner votre fichier .secrets pour vous connecter");
            return;
        }
        
        try {
            const result = await LoginUser(username, password, secretsFile, e);
            
            if (result === false){
                setError("Nom d'utilisateur, mot de passe incorrect ou fichier .secrets invalide") 
            }
            else{
                loginSucces(result)
            }
        } catch (error) {
            setError(error.message || "Erreur lors de l'authentification");
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setSecretsFile(file);
            setError(''); // Clear any previous errors
        }
    }

    return (
        <div className='auth-container'>
            <div className='auth-card'>
                <h2> Connexion </h2>
                <form onSubmit={VerifySucces}>
                {error && <div className="error-message">{error}</div>}
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
                        <label htmlFor='secretsFile'>Fichier .secrets (OBLIGATOIRE)</label>
                        <input
                            type='file'
                            id='secretsFile'
                            accept='.secrets'
                            onChange={handleFileChange}
                            required
                        />
                        <small className='file-help'>
                            🔒 La connexion nécessite votre fichier .secrets téléchargé lors de l'inscription
                        </small>
                    </div>

                    <button type='submit' className='auth-button'>
                         Se connecter
                    </button>
                </form>

                <div className='auth-footer'>
                    <p>Pas encore de compte ?</p>
                    <button onClick={onSwitchToRegister} className='switch-button'>
                        S'inscrire
                    </button>
                </div>
            </div>
        </div>
    );
}

