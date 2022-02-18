import { hydrate } from 'react-dom';
import { RemixBrowser } from 'remix';
import plausible from '~/utils/plausible';

plausible.enableAutoPageviews();

hydrate(<RemixBrowser />, document);
