// locales/en/index.ts
import { en as ENG } from "vuetify/locale";
import en from "./en.json";

const messages = {
  ...en,
  someKey: "Some message",
  $vuetify: ENG,
};
export default messages;
