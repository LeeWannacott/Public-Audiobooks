/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
  Audio: undefined;
  BottomTabs: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
  Explore: undefined;
  History: undefined;
  Bookshelf: undefined;
  Settings: undefined;
};

export interface Audiobook {
  url_rss: string;
  id: number;
  num_sections: number;
  url_text_source: string;
  url_zip_file: string;
  title: string;
  authors: {
    first_name: string;
    last_name: string;
  }[];
  totaltime: string;
  totaltimesecs: number;
  copyright_year: number;
  genres: string;
  language: string;
  url_project: string;
  url_librivox: string;
  url_iarchive: string;
}

export interface Review {
  createdate?: string;
  reviewbody?: string;
  reviewdate?: string;
  reviewer?: string;
  reviewtitle?: string;
  stars?: number;
}

export interface Suggestion {
  item: any;
  index: number;
  last_name: string;
  first_name: string;
}

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
