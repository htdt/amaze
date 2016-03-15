import {InitUI} from './ui';
import {World} from './engine/world';

InitUI();
(<any>window).amaze = new World();
