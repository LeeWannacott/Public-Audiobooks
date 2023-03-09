import AsyncStorage from "@react-native-async-storage/async-storage";

export const audiobookProgressTableName = "users_audiobooks_progress";
export function createAudioBookDataTable(db: any) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `create table if not exists ${audiobookProgressTableName} (id integer primary key not null, audiobook_id text not null unique, audiotrack_progress_bars text, current_audiotrack_positions text, audiobook_shelved int, audiobook_rating real, listening_progress_percent real, current_listening_time int, current_audiotrack_index int, audiobook_downloaded int, audiobook_finished int, users_audiobook_review text);`
    );
  });
}
export const audiobookHistoryTableName = "librivox_audiobooks_cache";
export function createHistoryTableDB(db: any) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `create table if not exists ${audiobookHistoryTableName} (id integer primary key not null, url_rss text not null unique, audiobook_id text not null unique, image text, title text, authors_first_name text, authors_last_name text, totaltime text, totaltimesecs int, copyright_year int, genres text, url_review text, num_sections int, url_text_source text, url_zip_file text, language text, url_project text, url_librivox text, url_iarchive text);`
    );
  });
}

export function addAudiobookToHistoryDB(db: any, audiobook: any) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `insert into ${audiobookHistoryTableName} (url_rss, audiobook_id, image, title, authors_first_name, authors_last_name, totaltime, totaltimesecs, copyright_year, genres, url_review, num_sections, url_text_source, url_zip_file, language, url_project, url_librivox, url_iarchive) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        audiobook?.url_rss,
        audiobook?.audiobook_id,
        audiobook?.image,
        audiobook?.title,
        audiobook?.authors_first_name,
        audiobook?.authors_last_name,
        audiobook?.totaltime,
        audiobook?.totaltimesecs,
        audiobook?.copyright_year,
        audiobook?.genres,
        audiobook?.url_review,
        audiobook?.num_sections,
        audiobook?.url_text_source,
        audiobook?.url_zip_file,
        audiobook?.language,
        audiobook?.url_project,
        audiobook?.url_librivox,
        audiobook?.url_iarchive,
      ]
    );
  }, null);
}

export function deleteAudiobookHistoryDB(db: any) {
  db.transaction((tx: any) => {
    tx.executeSql(`drop table ${audiobookHistoryTableName}`);
  }, null);
}
//
export function deleteAudiobookProgressDB(db: any) {
  db.transaction((tx: any) => {
    tx.executeSql(`drop table ${audiobookProgressTableName}`);
  }, null);
}

export function updateAudioTrackPositionsDB(db: any, auddiobookProgress: any) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `update ${audiobookProgressTableName} set audiotrack_progress_bars=?,current_audiotrack_positions=?,listening_progress_percent=?,current_listening_time=? where audiobook_id=?;`,
      [
        auddiobookProgress?.audiotrack_progress_bars,
        auddiobookProgress?.current_audiotrack_positions,
        auddiobookProgress?.listening_progress_percent,
        auddiobookProgress?.current_listening_time,
        auddiobookProgress?.audiobook_id,
      ]
    );
  });
}

export function updateAudioTrackIndexDB(
  db: any,
  audioTrackIndex: any,
  audiobook_id: any
) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `update ${audiobookProgressTableName} set current_audiotrack_index=? where audiobook_id=?;`,
      [audioTrackIndex, audiobook_id]
    );
  });
}

export function updateUsersAudiobookReviewDB(
  db: any,
  reviewInformation: any,
  audiobook_id: any
) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `update ${audiobookProgressTableName} set users_audiobook_review=? where audiobook_id=?;`,
      [reviewInformation, audiobook_id]
    );
  });
}

export function updateIfBookShelvedDB(
  db: any,
  audiobook_id: any,
  audiobook_shelved: any
) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `update ${audiobookProgressTableName} set audiobook_shelved=? where audiobook_id=?;`,
      [audiobook_shelved, audiobook_id]
    );
  });
}

export function updateListeningProgressDB(
  db: any,
  listening_progress_percent: any,
  current_listening_time: any,
  audiobook_id: any
) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `update ${audiobookProgressTableName} set listening_progress_percent=?,current_listening_time=? where audiobook_id=?;`,
      [listening_progress_percent, current_listening_time, audiobook_id]
    );
  });
}

export function updateAudiobookRatingDB(
  db: any,
  audiobook_id: any,
  audiobook_rating: any
) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `update ${audiobookProgressTableName} set audiobook_rating=? where audiobook_id=?;`,
      [audiobook_rating, audiobook_id]
    );
  });
}

export function initialAudioBookStoreDB(db: any, initialAudiobookData: any) {
  db.transaction((tx: any) => {
    tx.executeSql(
      `insert into ${audiobookProgressTableName}(audiobook_id, audiotrack_progress_bars, current_audiotrack_positions, audiobook_shelved, audiobook_rating) values(?,?,?,?,?)`,
      [
        initialAudiobookData?.audiobook_id,
        initialAudiobookData?.audiotrack_progress_bars,
        initialAudiobookData?.current_audiotrack_positions,
        initialAudiobookData?.audiobook_shelved,
        initialAudiobookData?.audiobook_rating,
      ]
    );
  });
}

export const storeAsyncData = async (key: any, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
};

export const getAsyncData = async (key: any) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    console.log(e);
  }
};
