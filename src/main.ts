import {InitUI} from './ui';
import {World} from './engine/world';

interface CustomWindow extends Window {
  amaze: World;
}

InitUI();
(<CustomWindow>window).amaze = new World();
