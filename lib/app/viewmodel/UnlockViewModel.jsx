import React, {useState, useEffect, useRef} from 'react';
import { tryUnlock, canTryUnlock, context } from '../domain';
import I18n from '../lang'
export default function UnlockViewModel({PinView}) {
    const [errorMessage, setErrorMessage] = useState('');
    const genErrorMessage = () => {
        if ( context.state.unlockTryLefted > 0 ) {
            return I18n.t('account.pinTryLeft').replace('${left}', context.state.unlockTryLefted);
        } else {
            return I18n.t('account.pinTryLeft').replace('${left}', 0);
        }
    }
    const onSubmit = async (pin) => {
        console.log(pin);
        const isCanTryUnlock = await canTryUnlock();
        if (!isCanTryUnlock) {
            setErrorMessage(genErrorMessage());
            return false;
        }
        try {
            const isUnlockSuccess = await tryUnlock(pin);
            if (isUnlockSuccess) {
                return true;
            } else {
                setErrorMessage(genErrorMessage());
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }
        
    return (
        <PinView
            errorMessage={errorMessage}
            onSubmit={onSubmit}
        />
    );
}

