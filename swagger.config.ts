// swagger.config.ts
import type { Options } from "swagger-jsdoc";

const swaggerDefinition = {
  // openapi: "3.0.0",
  info: {
    title: "Cashbook API",
    version: "5.0.0",
    description:
      "接口文档需要手动维护，因此不能保证完全正确，请以接口实际效果为准！",
  },
  servers: [
    {
      url: "http://localhost:9090/api",
      description: "本地服务器",
    },
  ],
  components: {
    // securitySchemes: {
    //   bearerAuth: {
    //     type: "http",
    //     scheme: "bearer",
    //     bearerFormat: "JWT",
    //     description: "用于认证的 JWT Bearer Token",
    //   },
    // },
    schemas: {
      // --- 开始引用你给出的类型定义 ---
      LoginParam: {
        username: "string | 用户名",
        password: "string | 密码",
      },

      // 统一最外层包装类
      Result: {
        c: "number | 业务状态码 200-成功；400-未登录；500-异常",
        d: "T | 业务数据 (泛型 T，在引用时需要具体化)",
        m: "string | 错误信息",
      },

      // 分页数据包装类
      Page: {
        pageNum: "number | 当前页码",
        pageSize: "number | 每页条数",
        pages: "number | 总页数",
        total: "number | 总条数",
        totalOut: "number | 总支出金额",
        totalIn: "number | 总收入金额",
        notInOut: "number | 不计收支金额",
        data: "array | 分页数据内容 (泛型 T，在引用时需要具体化)",
      },

      // 分页查询参数
      PageParam: {
        pageNum: "number | 请求的页码",
        pageSize: "number | 每页显示的条数",
      },

      // 用户信息
      UserInfo: {
        id: "number | 用户ID",
        name: "string | 用户昵称",
        username: "string | 用户名",
        createDate: "string | 用户创建日期",
      },

      // 月度分析数据
      MonthAnalysis: {
        month: "string | 月份，格式 YYYY-MM",
        outSum: "string | 总支出",
        inSum: "string | 总收入",
        zeroSum: "string | 总不计收支",
        maxInType: "string | 最大收入类型",
        maxInTypeSum: "string | 最大收入金额",
        maxOutType: "string | 最大支出类型",
        maxOutTypeSum: "string | 最大支出金额",
        maxOut: "Flow | 最大单笔支出流水",
        maxIn: "Flow | 最大单笔收入流水",
        maxZero: "Flow | 最大单笔不计收支流水",
      },

      // 创建流水的传输实体
      CreateFlowDto: {
        day: "string | 流水发生日期",
        flowType: "string | 流水类型 (in: 收入, out: 支出, zero: 不计收支)",
        type: "string | 分类类型 (例如：餐饮, 交通, 工资等)",
        payType: "string | 支付方式 (例如：现金, 支付宝, 微信支付, 银行卡)",
        money: "number | 金额",
        name: "string | 流水名称/标题",
        description: "string | 备注/描述",
      },

      // 更新流水的传输实体
      UpdateFlowDto: {
        day: "string | 流水发生日期",
        flowType: "string | 流水类型 (in: 收入, out: 支出, zero: 不计收支)",
        type: "string | 分类类型",
        payType: "string | 支付方式",
        money: "number | 金额",
        name: "string | 流水名称/标题",
        description: "string | 备注/描述",
      },

      // 流水查询参数
      FlowQuery: {
        pageNum: "number | 页码，默认为 1",
        pageSize: "number | 每页大小，默认为 20",
        id: "string|number | 流水ID",
        startDay: "string | 查询起始日期",
        endDay: "string | 查询结束日期",
        flowType: "string | 流水类型 (in: 收入, out: 支出, zero: 不计收支)",
        industryType: "string | 行业类型 (如果适用)",
        payType: "string | 支付方式",
        name: "string | 流水名称关键词",
        attribution: "string | 归属 (例如：个人, 家庭, 公司)",
        description: "string | 描述关键词",
        moneySort: "string | 金额排序方式 (asc: 升序, desc: 降序)",
      },

      //# 服务器配置信息
      Server: {
        version: "string | 服务器版本",
        dataPath: "string | 数据存储路径",
        openRegister: "boolean | 是否开放注册",
      },

      //# 管理员登录凭据
      AdminLogin: {
        account: "string | 管理员账号",
        password: "string | 管理员密码",
      },

      //# 通用图表查询参数
      CommonChartQuery: {
        flowType: "string | 流水类型 (in: 收入, out: 支出, zero: 不计收支)",
        startDay: "string | 查询起始日期",
        endDay: "string | 查询结束日期",
      },

      //# 通用图表数据
      CommonChartData: {
        type: "string | 数据标记 key (如日期、年月、支出类型等)",
        inSum: "number | 收入金额",
        outSum: "number | 支出金额",
        zeroSum: "number | 不计收支金额",
      },

      //# 类型操作实体 (用于修改分类名称等)
      Typer: {
        flowType: "string | 流水类型 (in: 收入, out: 支出, zero: 不计收支)",
        type: "string | 类别名称",
        value: "string | 新的类别值",
        oldValue: "string | 旧的类别值 (用于更新操作)",
      },

      //# 通用选择框选项
      CommonSelectOption: {
        title: "string | 选项显示文本",
        value: "string | 选项实际值",
      },

      // 系统设置
      SystemSetting: {
        id: "number | 系统设置ID",
        title: "string | 网站标题",
        description: "string | 网站描述",
        keywords: "string | 网站关键词",
        version: "string | 系统版本号",
        openRegister: "boolean | 是否开放用户注册",
        createDate: "string | 创建日期",
        updateBy: "string | 最后更新日期",
      },

      // 用户表
      User: {
        id: "number | 用户ID",
        username: "string | 用户名 (登录账号)",
        password: "string | 用户密码 (出于安全考虑，通常不应在API响应中返回)",
        name: "string | 用户昵称",
        email: "string | 用户邮箱",
        createDate: "string | 用户创建日期",
      },

      // 流水
      Flow: {
        id: "number | 流水ID",
        userId: "number | 流水所属用户ID",
        day: "string | 流水发生日期 (YYYY-MM-DD)",
        flowType: "string | 流水类型：收入(in)、支出(out)、不计收支(zero)",
        industryType: "string | 行业分类（例如：餐饮, 交通, 工资等）",
        payType: "string | 支付方式/收款方式（例如：现金, 支付宝, 银行卡）",
        money: "number | 金额",
        name: "string | 流水名称/标题",
        description: "string | 备注/描述",
        invoice: "string | 发票号或其他凭证信息",
        origin: 'string | 流水来源：如 "系统导入-支付宝", "手动创建-张三"',
        attribution:
          "string | 流水归属（谁的收入/支出，例如：个人, 家庭, 公共）",
        eliminate: "number | 平账标志：0-未平账；1-已平账；-1-忽略平账",
      },

      // Budget 支出计划(预算)
      Budget: {
        id: "number | 预算ID",
        userId: "number | 预算所属用户ID",
        month: "string | 预算所属月份 (YYYY-MM)",
        budget: "number | 预算金额",
        used: "number | 已使用金额",
      },

      // 固定流水 (定期收入/支出)
      FixedFlow: {
        id: "number | 固定流水ID",
        userId: "number | 固定流水所属用户ID",
        startMonth: "string | 开始生效月份 (YYYY-MM)",
        endMonth: "string | 结束生效月份 (YYYY-MM)",
        month: "string | 当前固定流水的月份 (用于记录当月生成情况)",
        money: "number | 金额",
        name: "string | 固定流水名称",
        description: "string | 备注/描述",
        flowType: "string | 流水类型：收入(in)、支出(out)、不计收支(zero)",
        industryType: "string | 行业分类（例如：居住, 交通等）",
        payType: "string | 支付方式/收款方式",
        attribution: "string | 流水归属（谁的收入/支出，例如：个人, 家庭）",
      },

      // 类型关联 (例如：分类映射)
      TypeRelation: {
        id: "number | 关联ID",
        userId: "number | 所属用户ID",
        source: "string | 源类型值 (例如：支付宝账单中的原始类别)",
        target: "string | 目标类型值 (映射到的系统内部类别)",
      },
      // --- 结束引用你给出的类型定义 ---
    },
  },
};

const options: Options = {
  swaggerDefinition,
  apis: ["./server/api/**/*.ts", "./server/routes/**/*.ts"],
};

export default options;
