import {InitUI} from './ui';
import {World} from './engine/world';

InitUI();
/* tslint:disable:no-string-literal */
window['amaze'] = new World();
/* tslint:enable:no-string-literal */
