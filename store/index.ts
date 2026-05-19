// store/index.ts
// Redux Toolkit store — mirrors the useReducer logic in PersonalizedDashboard.jsx
// Swap in this store for the full Next.js project.

import { configureStore, createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

/* ─── Types ─────────────────────────────────────────────────────────── */
export interface ContentItem {
  id:          string;
  type:        "news" | "movie" | "social" | "recommendation";
  category:    string;
  title:       string;
  description: string;
  author:      string;
  timeAgo:     string;
  imageId:     number;
  trending:    boolean;
  readTime:    string;
}

export interface ContentState {
  items:   ContentItem[];
  loading: boolean;
  error:   string | null;
}

export interface PrefsState {
  categories: string[];
  darkMode:   boolean;
}

export interface FavoritesState {
  items: ContentItem[];
}

/* ─── Async thunk: fetch AI content ─────────────────────────────────── */
export const fetchAIContent = createAsyncThunk<ContentItem[], string[]>(
  "content/fetchAI",
  async (categories, { rejectWithValue }) => {
    try {
      // In Next.js, proxy through an API route to protect the key:
      const res = await fetch("/api/content", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ categories }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.items as ContentItem[];
    } catch (err: any) {
      return rejectWithValue(err.message ?? "Unknown error");
    }
  }
);

/* ─── Content Slice ─────────────────────────────────────────────────── */
const contentSlice = createSlice({
  name: "content",
  initialState: { items: [], loading: false, error: null } as ContentState,
  reducers: {
    setItems(state, action: PayloadAction<ContentItem[]>) {
      state.items = action.payload;
    },
    reorderItems(state, action: PayloadAction<ContentItem[]>) {
      state.items = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAIContent.pending,  state => { state.loading = true;  state.error = null; })
      .addCase(fetchAIContent.fulfilled,(state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchAIContent.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; });
  },
});

/* ─── Preferences Slice ─────────────────────────────────────────────── */
const CATEGORY_MIN = 1; // Enforce at least 1 selected

const prefsSlice = createSlice({
  name: "prefs",
  initialState: { categories: ["Technology", "Entertainment", "Science"], darkMode: true } as PrefsState,
  reducers: {
    toggleCategory(state, action: PayloadAction<string>) {
      const cat = action.payload;
      if (state.categories.includes(cat)) {
        if (state.categories.length <= CATEGORY_MIN) return; // Guard
        state.categories = state.categories.filter(c => c !== cat);
      } else {
        state.categories.push(cat);
      }
    },
    setCategories(state, action: PayloadAction<string[]>) {
      if (action.payload.length >= CATEGORY_MIN) {
        state.categories = action.payload;
      }
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },
  },
});

/* ─── Favorites Slice ───────────────────────────────────────────────── */
const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { items: [] } as FavoritesState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const exists = state.items.some(i => i.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter(i => i.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }
    },
    clearFavorites(state) {
      state.items = [];
    },
  },
});

/* ─── Persist config ────────────────────────────────────────────────── */
const rootReducer = combineReducers({
  content:   contentSlice.reducer,
  prefs:     prefsSlice.reducer,
  favorites: favoritesSlice.reducer,
});

const persistConfig = {
  key:       "pulse-dashboard",
  storage,
  whitelist: ["prefs", "favorites"], // Don't persist fetched content
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ─── Store ─────────────────────────────────────────────────────────── */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefault =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState    = ReturnType<typeof rootReducer>;
export type AppDispatch  = typeof store.dispatch;

/* ─── Exported actions ──────────────────────────────────────────────── */
export const { setItems, reorderItems, clearError }        = contentSlice.actions;
export const { toggleCategory, setCategories, setDarkMode } = prefsSlice.actions;
export const { toggleFavorite, clearFavorites }             = favoritesSlice.actions;

/* ─── Typed hooks ───────────────────────────────────────────────────── */
// hooks/useAppDispatch.ts  →  export const useAppDispatch = () => useDispatch<AppDispatch>();
// hooks/useAppSelector.ts  →  export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;