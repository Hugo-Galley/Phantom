// Génération d'une clé secrète basée sur username, password et salt
export async function generateSecretKey(username, password) {
    // Génération d'un salt unique
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    const salt = Array.from(saltArray, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Combinaison des données
    const combinedData = username + password + salt + "PHANTOM_2FA_2024";
    
    // Hash avec SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Conversion en Base32 pour le secret
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
        secret += base32Chars[hashArray[i] % 32];
    }
    
    return { secret, salt };
}

// Génération du hash de vérification pour le serveur
export async function generateVerificationHash(username, password, salt) {
    const combinedData = username + password + salt + "PHANTOM_VERIFICATION";
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Conversion en base64 pour correspondre au serveur
    const hashArray = new Uint8Array(hashBuffer);
    const binaryString = String.fromCharCode(...hashArray);
    return btoa(binaryString);
}

// Génération du contenu du fichier .secrets
export function generateSecretsFileContent(username, secretKey, salt) {
    const timestamp = new Date().toISOString();
    const fileContent = {
        username: username,
        secret: secretKey,
        salt: salt,
        generated_at: timestamp,
        app: "Phantom",
        version: "1.0"
    };
    return JSON.stringify(fileContent, null, 2);
}

// Téléchargement du fichier .secrets
export function downloadSecretsFile(username, secretKey, salt) {
    const content = generateSecretsFileContent(username, secretKey, salt);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username}_phantom.secrets`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { secretKey, salt };
}

// Validation du fichier .secrets
export function validateSecretsFile(file, expectedUsername) {
    return new Promise((resolve, reject) => {
        if (!file.name.endsWith('.secrets')) {
            reject(new Error('Le fichier doit avoir l\'extension .secrets'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = JSON.parse(e.target.result);
                
                // Vérifications de base
                if (!content.username || !content.secret || !content.salt || !content.app) {
                    reject(new Error('Fichier .secrets invalide - structure incorrecte'));
                    return;
                }
                
                if (content.app !== 'Phantom') {
                    reject(new Error('Ce fichier .secrets n\'est pas pour l\'application Phantom'));
                    return;
                }
                
                if (content.username !== expectedUsername) {
                    reject(new Error(`Ce fichier .secrets appartient à ${content.username}, pas à ${expectedUsername}`));
                    return;
                }
                
                // Validation de la clé secrète (format Base32)
                const base32Regex = /^[A-Z2-7]{32}$/;
                if (!base32Regex.test(content.secret)) {
                    reject(new Error('Clé secrète invalide dans le fichier'));
                    return;
                }
                
                // Validation du salt (format hexadécimal)
                const hexRegex = /^[a-f0-9]{32}$/;
                if (!hexRegex.test(content.salt)) {
                    reject(new Error('Salt invalide dans le fichier'));
                    return;
                }
                
                resolve({
                    username: content.username,
                    secret: content.secret,
                    salt: content.salt,
                    generated_at: content.generated_at
                });
                
            } catch (error) {
                reject(new Error('Impossible de lire le fichier .secrets - format JSON invalide'));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Erreur lors de la lecture du fichier'));
        };
        
        reader.readAsText(file);
    });
}

// Stockage sécurisé temporaire de la clé (en session, pas en localStorage)
export function storeSecretKeyTemporary(secretKey) {
    sessionStorage.setItem('phantom_2fa_key', secretKey);
}

// Récupération de la clé temporaire
export function getStoredSecretKey() {
    return sessionStorage.getItem('phantom_2fa_key');
}

// Nettoyage de la clé temporaire
export function clearStoredSecretKey() {
    sessionStorage.removeItem('phantom_2fa_key');
}

// Génération d'un code de vérification basé sur la clé secrète et un timestamp
export function generateVerificationCode(secretKey) {
    // Utilisation d'un timestamp simplifié pour générer un code
    const timestamp = Math.floor(Date.now() / 30000); // Change toutes les 30 secondes
    const combinedString = secretKey + timestamp.toString();
    
    // Hash simple pour générer un code à 6 chiffres
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    const code = Math.abs(hash) % 1000000;
    return code.toString().padStart(6, '0');
}

// Vérification d'un code 2FA
export function verifyCode(secretKey, inputCode) {
    const expectedCode = generateVerificationCode(secretKey);
    return inputCode === expectedCode;
}