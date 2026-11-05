import { MenuItem, Order, RestaurantTable, CartItem } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from '../data/initialData';
import {
  getMenuItemsFromSupabase,
  getRestaurantTablesFromSupabase,
  createOrderViaSupabaseRpc,
  getSupabasePublishableKey,
} from './supabaseClient';

const STORAGE_KEYS = {
