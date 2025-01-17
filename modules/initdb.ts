import { defineNuxtModule } from "nuxt/kit";
import prisma from "~/lib/prisma";
// import {usePrismaClient} from ""

export default defineNuxtModule({
  meta: {
    name: "initdb",
  },
  setup(options, nuxt) {
    nuxt.hook("nitro:init", async (nitro) => {
      // This code will run when Nitro is initialized
      console.log("nitro:init");
    });
  },
});
