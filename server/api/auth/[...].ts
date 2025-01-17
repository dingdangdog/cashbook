import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { NuxtAuthHandler } from "#auth";
import { encryptBySHA256 } from "~/server/utils/common";
import prisma from "~/lib/prisma";

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
    signOut: "/auth/login",
  },
  providers: [
    // @ts-ignore Use .default here for it to work during SSR.
    // GithubProvider.default({
    //   clientId: useRuntimeConfig().githubClientId,
    //   clientSecret: useRuntimeConfig().githubClientSecrets,
    // }),
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        // console.log(credentials);
        const username = String(credentials?.username || "");
        const password = String(credentials?.password || "");

        const entrypassword = encryptBySHA256(username, password);
        const users = await prisma.user.findMany({
          where: {
            username: username,
            password: entrypassword,
          },
        });
        if (!users || users.length != 1) {
          return null;
        }
        const user = users[0];
        return {
          id: user.id,
          name: user.username,
          email: user.email,
          // image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    // jwt回调，用于处理 token 和用户信息
    async jwt(param) {
      if (param.account) {
        // console.log("jwtparam", param);
        if (param.account.provider == "github") {
        } else if (param.account.provider == "credentials") {
          param.token.id = String(param.user.id); // 将用户 ID 存储到 token 中
          param.token.name = String(param.user.name);
          param.token.picture = String(param.user.image);
          param.token.email = String(param.user.email);
          param.token.provider = "credentials";
        }
      }
      return param.token;
    },
    async redirect({ url, baseUrl }) {
      // console.log(1, url, baseUrl);
      // 默认将用户重定向到有效的 URL
      if (
        url.startsWith("http://localhost:9090") ||
        baseUrl.startsWith("http://localhost:9090")
      ) {
        const authOrigin = useRuntimeConfig().authOrigin;
        // console.log(authOrigin);

        let realBaseUrl = "";
        if (authOrigin.startsWith("https://")) {
          realBaseUrl = `https://${
            authOrigin.replace("https://", "").split("/")[0]
          }`;
        } else if (authOrigin.startsWith("http://")) {
          realBaseUrl = `http://${
            authOrigin.replace("http://", "").split("/")[0]
          }`;
        }

        url = url.replace("http://localhost:9090", realBaseUrl);
        baseUrl = baseUrl.replace("http://localhost:9090", realBaseUrl);
      }
      // console.log(2, url, baseUrl);
      return url.startsWith(baseUrl) ? url : baseUrl + url;
    },
    async session(param) {
      // Token we injected into the JWT callback above.
      const token = param.token;
      // console.log("token", param.token);

      // Fetch data OR add previous data from the JWT callback.
      const user: any = {
        id: token.id,
        name: token.name,
      };

      // Return the modified session
      return {
        ...param.session,
        user: user,
      };
    },
  },
});
