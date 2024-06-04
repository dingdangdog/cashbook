<script setup lang="ts">

</script>

<template>
  <div class="block text-center">
    <el-carousel>
      <el-carousel-item class="report-item">
        <h3 class="small justify-center">
          账本：test
        </h3>
        <h3 class="small justify-center">
          共10笔支出，合计：test
        </h3>
        <h3 class="small justify-center">
          共10笔收入，合计：test
        </h3>
      </el-carousel-item>
      <el-carousel-item class="report-item">
        <h3 class="small justify-center">
          第一笔支出：
        </h3>
        <h3 class="small justify-center">
          第一笔收入：
        </h3>
        <h3 class="small justify-center">
          最后一笔支出：
        </h3>
        <h3 class="small justify-center">
          最后一笔收入：
        </h3>
      </el-carousel-item>
      <el-carousel-item class="report-item">
        <h3 class="small justify-center">
          最高单笔支出：test
        </h3>
        <h3 class="small justify-center">
          2023年1月23日，支付宝支付，美团购买黄焖鸡
        </h3>
        <h3 class="small justify-center">
          最高单笔收入：test
        </h3>
        <h3 class="small justify-center">
          2023年1月23日，支付宝收入，退款
        </h3>
      </el-carousel-item>
      <el-carousel-item class="report-item">
        <h3 class="small justify-center">
          最高支出月：test
        </h3>
        <h3 class="small justify-center">
          共10笔支出，合计：100
        </h3>
        <h3 class="small justify-center">
          最高收入月：test
        </h3>
        <h3 class="small justify-center">
          共10笔收入，合计：100
        </h3>
      </el-carousel-item>
      <el-carousel-item class="report-item">
        <h3 class="small justify-center">
          最高支出类型：test
        </h3>
        <h3 class="small justify-center">
          共10笔支出，合计：100
        </h3>
        <h3 class="small justify-center">
          最高收入类型：test
        </h3>
        <h3 class="small justify-center">
          共10笔收入，合计：100
        </h3>
      </el-carousel-item>
    </el-carousel>
  </div>
  <el-space direction="vertical">
    <el-text tag="p">This is a paragraph.</el-text>
    <el-text tag="b">Bold</el-text>
    <el-text tag="i">Italic</el-text>
    <el-text>
      This is
      <el-text tag="sub" size="small">subscript</el-text>
    </el-text>
    <el-text>
      This is
      <el-text tag="sup" size="small">superscript</el-text>
    </el-text>
    <el-text tag="ins">Inserted</el-text>
    <el-text tag="del">Deleted</el-text>
    <el-text tag="mark">Marked</el-text>
  </el-space>
</template>

<style scoped>
.report-item {
  padding: 1rem;
}
</style>
