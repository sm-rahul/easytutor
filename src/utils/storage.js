import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@easytutor_history';
const STATS_KEY = '@easytutor_stats';

export async function getHistory() {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveHistoryItem(item) {
  try {
    const history = await getHistory();
    const newItem = {
      id: Date.now().toString(),
      ...item,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...history];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    await incrementStat('totalScans');
    return newItem;
  } catch {
    return null;
  }
}

export async function deleteHistoryItem(id) {
  try {
    const history = await getHistory();
    const updated = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function getStats() {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    const stats = data ? JSON.parse(data) : { totalScans: 0 };
    const history = await getHistory();
    return { ...stats, totalSaved: history.length };
  } catch {
    return { totalScans: 0, totalSaved: 0 };
  }
}

async function incrementStat(key) {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    const stats = data ? JSON.parse(data) : {};
    stats[key] = (stats[key] || 0) + 1;
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // silent fail
  }
}
