import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';

const pokedexState = (state: RootState) => state.pokedex;

export const pokedexSelector = createSelector(pokedexState, pokedex => pokedex);
