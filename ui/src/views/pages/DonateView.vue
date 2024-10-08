<template>
  <div class="donate-page" style="max-width: 1280px; margin: 0 auto; padding: 0.5rem">
    <h2>捐赠说明</h2>
    <p>
      非常高兴您能使用我开源的软件, 我是
      <a href="https://www.oldmoon.top" target="_blank">DingDangDog</a>, 一位开源软件的独立开发者,
      致力于提供高质量、免费的工具和资源。
    </p>
    <p>感谢您访问我的捐赠页面！您的支持将帮助我继续专注于开发和维护这些开源项目。</p>
    <p>
      如果您认为我的工作对您有帮助，任何形式的捐赠都会对我产生极大的鼓励！无论金额大小，您的支持不仅仅是对我努力的认可，也是对整个开源社区的支持。
    </p>
    <p>您的捐赠将帮助我：</p>

    <ol style="padding-left: 2rem">
      <li>继续维护现有的项目，修复Bug并提供更新。</li>
      <li>开发更多有用的功能和新工具。</li>
      <li>支付服务器、工具和其他开发相关的费用。</li>
      <li>有更多时间专注于开源项目，减少生活经济压力。</li>
    </ol>

    <h3>捐赠方式：</h3>
    <h4>支付宝/微信支付：扫码支付支持（二维码将会在下方展示）</h4>

    <div class="donate-image">
      <div style="margin: 1rem; border: 1px pink solid">
        <v-img
          src="https://images.oldmoon.top/images/dingdangdog/dingdangdog-1681366454631.jpg"
          alt="alipay"
          style="width: 18rem; height: 32rem; overflow: hidden"
          cover
        ></v-img>
      </div>
      <div style="margin: 1rem; border: 1px pink solid">
        <v-img
          src="https://images.oldmoon.top/images/dingdangdog/dingdangdog-1681366402959.jpg"
          alt="wechat"
          style="width: 18rem; height: 32rem; overflow: hidden"
          cover
        ></v-img>
      </div>
    </div>

    <h4>PayPal</h4>
    <p>您可以通过 PayPal 链接(<a href="https://paypal.me/dddogx" target="_blank">dingdangdog</a>) 捐赠</p>
    <!-- <h4>GitHub Sponsor</h4>
    <p>您还可以在 GitHub Sponsors 上赞助我</p> -->

    <p>
      <b> 感谢每一位支持我的人！ </b>
    </p>

    <!-- <h3>关注我</h3> -->
    <!-- Github Twitter 微信公众号 Bilibili -->

    <p>
      <b> 无论是通过捐赠，还是在项目中留下反馈或建议，您的参与都对我意义重大。 </b>
    </p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.donate-page p {
  margin: 0.5rem 0;
}

h2,
h3 {
  margin: 1rem 0;
}

.donate-image {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
</style>
