// locales/en/index.ts
import { zhHans } from "vuetify/locale";
import zh from "./zh.json";

const messages = {
  ...zh,
  someKey: "Some message",
  $vuetify: zhHans,
};
export default messages;
