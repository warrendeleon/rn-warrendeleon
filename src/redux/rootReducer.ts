import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer} from '../modules/status/reducer';
import {workXPReducer} from '../modules/workXP/reducer';
import {settingsReducer} from '../modules/settings/reducer';
import {profileReducer} from '../modules/profile/reducer';
import {pokedexReducer} from '../modules/pokedex/reducer';

export const rootReducer = combineReducers({
  status: statusReducer,
  workXP: workXPReducer,
  settings: settingsReducer,
  profile: profileReducer,
  pokedex: pokedexReducer,
});
