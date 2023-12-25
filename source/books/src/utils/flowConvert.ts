import type { Flow } from '@/types/model/flow'

export function alipayConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {  }
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = row[indexMap.get('收/支')]
  flow.type = row[indexMap.get('交易分类')] + '-ALI'
  flow.payType = '支付宝'
  flow.money = row[indexMap.get('金额')]
  flow.name = row[indexMap.get('交易对方')]
  flow.description = row[indexMap.get('商品说明')] + '-' + row[indexMap.get('备注')]
  return flow
}


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