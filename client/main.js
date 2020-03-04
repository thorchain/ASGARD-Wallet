import '/imports/startup/client'
import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';

import '/imports/ui/lib/styles/main.scss'

import { UserTransactions as UT } from '/imports/api/collections/client_collections'

UserTransactions = UT
