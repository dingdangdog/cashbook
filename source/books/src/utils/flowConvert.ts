import type { Flow } from '@/types/model/flow'

/**
 * 支付宝
 * @param row
 * @param indexMap
 */
export function alipayConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {  }
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = row[indexMap.get('收/支')]
  // + '' 防止数据不是字符串导致报错
  flow.type = row[indexMap.get('交易分类')] + ''
  flow.payType = '支付宝'
  flow.money = row[indexMap.get('金额')]
  flow.name = row[indexMap.get('交易对方')]
  flow.description = row[indexMap.get('商品说明')] + '-' + row[indexMap.get('备注')]
  return flow
}

/**
 * 微信支付
 * @param row
 * @param indexMap
 */
export function wxpayConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {}
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = row[indexMap.get('收/支')]
  flow.type = row[indexMap.get('交易类型')] + '-WX'
  flow.payType = '微信'
  flow.money = parseFloat((row[indexMap.get('金额(元)')]).replace('¥', ''))
  flow.name = row[indexMap.get('商品')]
  flow.description = row[indexMap.get('交易对方')] + '-' + row[indexMap.get('支付方式')] + '-' + row[indexMap.get('备注')]
  return flow
}

/**
 * 京东金融
 * @param row
 * @param indexMap
 */
export function jdFinanceConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {}
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = row[indexMap.get('收/支')]
  flow.type = row[indexMap.get('交易分类')]
  flow.payType = '京东金融'
  flow.money = parseFloat(row[indexMap.get('金额')])
  flow.name = row[indexMap.get('交易说明')]
  flow.description = row[indexMap.get('商户名称')] + '-' + row[indexMap.get('收/付款方式')] + '-' + row[indexMap.get('备注')]
  return flow
}
