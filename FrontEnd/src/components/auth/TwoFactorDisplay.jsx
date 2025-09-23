import React, { useState, useEffect } from 'react';
import { generateVerificationCode, getStoredSecretKey } from '../../scripts/2FA';

export default function TwoFactorDisplay() {
    const [currentCode, setCurrentCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const secretKey = getStoredSecretKey();
        if (!secretKey) return;

        // Générer le code initial
        setCurrentCode(generateVerificationCode(secretKey));

        // Mettre à jour le code toutes les 30 secondes
        const interval = setInterval(() => {
            setCurrentCode(generateVerificationCode(secretKey));
            setTimeLeft(30);
        }, 30000);

        // Compter les secondes restantes
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []);

    if (!currentCode) {
        return null;
    }

    return (
        <div className="two-factor-display">
            <h3>Code de vérification 2FA</h3>
            <div className="verification-code">
                {currentCode}
            </div>
            <div className="time-left">
                Nouveau code dans : {timeLeft}s
            </div>
            <p className="help-text">
                Ce code change toutes les 30 secondes et peut être utilisé pour des vérifications supplémentaires.
            </p>
        </div>
    );
}