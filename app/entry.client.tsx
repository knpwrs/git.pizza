import { hydrate } from 'react-dom';
import { RemixBrowser } from 'remix';
import plausible from '~/utils/plausible';

plausible.enableAutoPageviews();
plausible.enableAutoOutboundTracking();

hydrate(<RemixBrowser />, document);
