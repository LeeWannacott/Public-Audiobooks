import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

export function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("libri_audire.db");
  return db;
}

export function roundNumberTwoDecimal(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
