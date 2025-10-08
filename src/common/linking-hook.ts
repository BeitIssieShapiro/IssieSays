import { Linking } from 'react-native';
import { useContext, useEffect, useRef } from 'react';
import { GlobalContext } from './global-context';

export function useIncomingURL(onLinkReceived: (url: string) => void) {
    const handledLink = useRef<string | null>(null);
    const context = useContext(GlobalContext);

    useEffect(() => {
        const handleUrl = ({ url }: { url: string | null }) => {
            if (url) {
                handledLink.current = url;
                onLinkReceived(url);
            }
        };

        const linkingUrlSubscription = Linking.addEventListener('url', handleUrl);

        // Handle initial cold start link
        (async () => {
            if (context && context.url) {
                setTimeout(() => handleUrl({ url: context.url }));
            } else {
                const url = await Linking.getInitialURL();
                if (url) {
                    setTimeout(() => handleUrl({ url }));
                }
            }
        })();

        return () => {
            linkingUrlSubscription.remove();
        };

    }, []);
}
