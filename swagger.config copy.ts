// swagger.config.ts
import type { Options } from "swagger-jsdoc";

const swaggerDefinition = {
  // openapi: "3.0.0",
  info: {
    title: "Cashbook API",
    version: "4.3.1",
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
        type: "object",
        properties: {
          pageNum: {
            type: "number",
            description: "当前页码",
            example: 1,
          },
          pageSize: {
            type: "number",
            description: "每页条数",
            example: 10,
          },
          pages: {
            type: "number",
            description: "总页数",
            example: 5,
          },
          total: {
            type: "number",
            description: "总条数",
            example: 50,
          },
          totalOut: {
            type: "number",
            description: "总支出金额",
            example: 1234.56,
          },
          totalIn: {
            type: "number",
            description: "总收入金额",
            example: 7890.12,
          },
          notInOut: {
            type: "number",
            description: "不计收支金额",
            example: 50.0,
          },
          data: {
            type: "array",
            description: "分页数据内容 (泛型 T，在引用时需要具体化)",
            items: {}, // 这里同样是泛型 T，在实际使用时应替换为具体的数据模型
          },
        },
      },

      // 分页查询参数
      PageParam: {
        type: "object",
        properties: {
          pageNum: {
            type: "number",
            description: "请求的页码",
            example: 1,
          },
          pageSize: {
            type: "number",
            description: "每页显示的条数",
            example: 10,
          },
        },
        required: ["pageNum", "pageSize"],
      },

      // 用户信息
      UserInfo: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "用户ID",
            example: 1001,
          },
          name: {
            type: "string",
            description: "用户昵称",
            example: "Alice",
          },
          username: {
            type: "string",
            description: "用户名",
            example: "alice_admin",
          },
          createDate: {
            type: "string",
            format: "date-time",
            description: "用户创建日期",
            example: "2023-01-15T10:30:00Z",
          },
        },
        required: ["id", "name", "username", "createDate"],
      },

      // 月度分析数据
      MonthAnalysis: {
        type: "object",
        properties: {
          month: {
            type: "string",
            description: "月份，格式 YYYY-MM",
            example: "2023-01",
          },
          outSum: {
            type: "string", // 考虑改为 number
            description: "总支出",
            example: "1500.25",
          },
          inSum: {
            type: "string", // 考虑改为 number
            description: "总收入",
            example: "3000.50",
          },
          zeroSum: {
            type: "string", // 考虑改为 number
            description: "总不计收支",
            example: "50.00",
          },
          maxInType: {
            type: "string",
            description: "最大收入类型",
            example: "工资",
          },
          maxInTypeSum: {
            type: "string", // 考虑改为 number
            description: "最大收入金额",
            example: "2500.00",
          },
          maxOutType: {
            type: "string",
            description: "最大支出类型",
            example: "餐饮",
          },
          maxOutTypeSum: {
            type: "string", // 考虑改为 number
            description: "最大支出金额",
            example: "800.00",
          },
          maxOut: {
            $ref: "#/components/schemas/Flow", // 引用 Flow 实体
            description: "最大单笔支出流水",
          },
          maxIn: {
            $ref: "#/components/schemas/Flow", // 引用 Flow 实体
            description: "最大单笔收入流水",
          },
          maxZero: {
            $ref: "#/components/schemas/Flow", // 引用 Flow 实体
            description: "最大单笔不计收支流水",
          },
        },
      },

      // 创建流水的传输实体
      CreateFlowDto: {
        type: "object",
        properties: {
          day: {
            type: "string",
            format: "date",
            description: "流水发生日期",
            example: "2023-07-24",
          },
          flowType: {
            type: "string",
            description: "流水类型 (in: 收入, out: 支出, zero: 不计收支)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          bookId: {
            type: ["number", "string"],
            description: "账本ID",
            example: 1,
          },
          type: {
            type: "string",
            description: "分类类型 (例如：餐饮, 交通, 工资等)",
            example: "餐饮",
          },
          payType: {
            type: "string",
            description: "支付方式 (例如：现金, 支付宝, 微信支付, 银行卡)",
            example: "支付宝",
          },
          money: {
            type: "number",
            format: "float",
            description: "金额",
            example: 50.0,
          },
          name: {
            type: "string",
            description: "流水名称/标题",
            example: "午餐",
          },
          description: {
            type: "string",
            description: "备注/描述",
            example: "公司附近餐厅的午餐",
          },
        },
      },

      // 更新流水的传输实体
      UpdateFlowDto: {
        type: "object",
        properties: {
          day: {
            type: "string",
            format: "date",
            description: "流水发生日期",
            example: "2023-07-24",
          },
          bookId: {
            type: ["number", "string"],
            description: "账本ID",
            example: 1,
          },
          flowType: {
            type: "string",
            description: "流水类型 (in: 收入, out: 支出, zero: 不计收支)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          type: {
            type: "string",
            description: "分类类型",
            example: "餐饮",
          },
          payType: {
            type: "string",
            description: "支付方式",
            example: "支付宝",
          },
          money: {
            type: "number",
            format: "float",
            description: "金额",
            example: 65.5,
          },
          name: {
            type: "string",
            description: "流水名称/标题",
            example: "晚餐",
          },
          description: {
            type: "string",
            description: "备注/描述",
            example: "朋友聚餐",
          },
        },
      },

      // 流水查询参数
      FlowQuery: {
        type: "object",
        properties: {
          pageNum: {
            type: "number",
            description: "页码，默认为 1",
            default: 1,
            example: 1,
          },
          pageSize: {
            type: "number",
            description: "每页大小，默认为 20",
            default: 20,
            example: 20,
          },
          id: {
            type: ["string", "number"],
            description: "流水ID",
            example: 101,
          },
          bookId: {
            type: ["string", "number"],
            description: "账本ID",
            example: 1,
          },
          startDay: {
            type: "string",
            format: "date",
            description: "查询起始日期",
            example: "2023-07-01",
          },
          endDay: {
            type: "string",
            format: "date",
            description: "查询结束日期",
            example: "2023-07-31",
          },
          flowType: {
            type: "string",
            description: "流水类型 (in: 收入, out: 支出, zero: 不计收支)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          industryType: {
            type: "string",
            description: "行业类型 (如果适用)",
            example: "餐饮业",
          },
          payType: {
            type: "string",
            description: "支付方式",
            example: "支付宝",
          },
          name: {
            type: "string",
            description: "流水名称关键词",
            example: "购物",
          },
          attribution: {
            type: "string",
            description: "归属 (例如：个人, 家庭, 公司)",
            example: "个人",
          },
          description: {
            type: "string",
            description: "描述关键词",
            example: "零食",
          },
          moneySort: {
            type: "string",
            description: "金额排序方式 (asc: 升序, desc: 降序)",
            enum: ["asc", "desc"],
            example: "desc",
          },
        },
      },

      //# 服务器配置信息
      Server: {
        type: "object",
        properties: {
          version: {
            type: "string",
            description: "服务器版本",
            example: "1.0.0",
          },
          dataPath: {
            type: "string",
            description: "数据存储路径",
            example: "/app/data",
          },
          openRegister: {
            type: "boolean", // 建议改为 boolean
            description: "是否开放注册",
            example: true,
          },
        },
      },

      //# 管理员登录凭据
      AdminLogin: {
        type: "object",
        properties: {
          account: {
            type: "string",
            description: "管理员账号",
            example: "admin",
          },
          password: {
            type: "string",
            format: "password",
            description: "管理员密码",
            example: "your_password",
          },
        },
        required: ["account", "password"],
      },

      //# 通用图表查询参数
      CommonChartQuery: {
        type: "object",
        properties: {
          bookId: {
            type: "string",
            description: "账本ID",
            example: "1",
          },
          flowType: {
            type: "string",
            description: "流水类型 (in: 收入, out: 支出, zero: 不计收支)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          startDay: {
            type: "string",
            format: "date",
            description: "查询起始日期",
            example: "2023-01-01",
          },
          endDay: {
            type: "string",
            format: "date",
            description: "查询结束日期",
            example: "2023-12-31",
          },
        },
      },

      //# 通用图表数据
      CommonChartData: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "数据标记 key (如日期、年月、支出类型等)",
            example: "餐饮",
          },
          inSum: {
            type: "number",
            format: "float",
            description: "收入金额",
            example: 1200.5,
          },
          outSum: {
            type: "number",
            format: "float",
            description: "支出金额",
            example: 800.75,
          },
          zeroSum: {
            type: "number",
            format: "float",
            description: "不计收支金额",
            example: 50.0,
          },
        },
        required: ["type", "inSum", "outSum", "zeroSum"],
      },

      //# 类型操作实体 (用于修改分类名称等)
      Typer: {
        type: "object",
        properties: {
          bookId: {
            type: "string",
            description: "账本ID",
            example: "1",
          },
          flowType: {
            type: "string",
            description: "流水类型 (in: 收入, out: 支出, zero: 不计收支)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          type: {
            type: "string",
            description: "类别名称",
            example: "餐饮",
          },
          value: {
            type: "string",
            description: "新的类别值",
            example: "餐饮娱乐",
          },
          oldValue: {
            type: "string",
            description: "旧的类别值 (用于更新操作)",
            example: "餐饮",
          },
        },
        // required: [] // 根据业务逻辑决定哪些字段是必填的
      },

      //# 通用选择框选项
      CommonSelectOption: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "选项显示文本",
            example: "支付宝",
          },
          value: {
            type: "string",
            description: "选项实际值",
            example: "alipay",
          },
        },
        required: ["title", "value"],
      },

      // 系统设置
      SystemSetting: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "系统设置ID",
            example: 1,
          },
          title: {
            type: "string",
            description: "网站标题",
            example: "我的记账系统",
          },
          description: {
            type: "string",
            description: "网站描述",
            example: "个人收支管理平台",
          },
          keywords: {
            type: "string",
            description: "网站关键词",
            example: "记账, 财务, 收支",
          },
          version: {
            type: "string",
            description: "系统版本号",
            example: "1.0.0",
          },
          openRegister: {
            type: "boolean",
            description: "是否开放用户注册",
            example: true,
          },
          createDate: {
            type: "string",
            format: "date-time", // 或者 'date' 如果只关心日期
            description: "创建日期",
            example: "2024-07-24T10:00:00Z", // 更新为当前时间附近
          },
          updateBy: {
            type: "string",
            format: "date-time", // 或者 'date' 如果只关心日期
            description: "最后更新日期",
            example: "2024-07-24T11:30:00Z", // 更新为当前时间附近
          },
        },
        required: [
          "id",
          "title",
          "description",
          "keywords",
          "version",
          "openRegister",
          "createDate",
          "updateBy",
        ],
      },

      // 用户表
      User: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "用户ID",
            example: 1001,
          },
          username: {
            type: "string",
            description: "用户名 (登录账号)",
            example: "johndoe",
          },
          password: {
            type: "string",
            format: "password", // 指示这是一个密码字段，在UI中会隐藏值
            description: "用户密码 (出于安全考虑，通常不应在API响应中返回)",
            example: "securepassword123",
          },
          name: {
            type: "string",
            description: "用户昵称",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "用户邮箱",
            example: "john.doe@example.com",
          },
          createDate: {
            type: "string",
            format: "date-time",
            description: "用户创建日期",
            example: "2024-01-01T10:00:00Z",
          },
        },
        required: ["id", "username", "password", "email", "createDate"], // 'name' 是可选的，所以不在这里
      },

      // 账本
      Book: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "账本内部ID",
            example: 1,
          },
          bookId: {
            type: "string",
            description: "账本唯一标识符 (例如 UUID)",
            example: "book-abc-123",
          },
          bookName: {
            type: "string",
            description: "账本名称",
            example: "我的家庭账本",
          },
          shareKey: {
            type: "string",
            description: "账本分享密钥 (用于共享，如果需要)",
            example: "xyz789",
          },
          userId: {
            type: "number",
            description: "账本所属用户ID",
            example: 1001,
          },
          budget: {
            type: "number",
            format: "float",
            description: "账本预算金额",
            example: 1500.0,
          },
          createDate: {
            type: "string",
            format: "date-time",
            description: "账本创建日期",
            example: "2024-03-01T11:00:00Z",
          },
        },
        required: [
          "id",
          "bookId",
          "bookName",
          "userId",
          "budget",
          "createDate",
        ],
      },

      // 流水
      Flow: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "流水ID",
            example: 101,
          },
          userId: {
            type: "number",
            description: "流水所属用户ID",
            example: 1001,
          },
          bookId: {
            type: "string",
            description: "流水所属账本ID",
            example: "book-abc-123",
          },
          day: {
            type: "string",
            format: "date",
            description: "流水发生日期 (YYYY-MM-DD)",
            example: "2024-07-24",
          },
          flowType: {
            type: "string",
            description: "流水类型：收入(in)、支出(out)、不计收支(zero)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          industryType: {
            type: "string",
            description: "行业分类（例如：餐饮, 交通, 工资等）",
            example: "餐饮",
          },
          payType: {
            type: "string",
            description: "支付方式/收款方式（例如：现金, 支付宝, 银行卡）",
            example: "支付宝",
          },
          money: {
            type: "number",
            format: "float",
            description: "金额",
            example: 50.5,
          },
          name: {
            type: "string",
            description: "流水名称/标题",
            example: "午餐",
          },
          description: {
            type: "string",
            description: "备注/描述",
            example: "和同事一起吃的快餐",
          },
          invoice: {
            type: "string",
            description: "发票号或其他凭证信息",
            example: "INV-20240724-001",
          },
          origin: {
            type: "string",
            description: '流水来源：如 "系统导入-支付宝", "手动创建-张三"',
            example: "手动创建-张三",
          },
          attribution: {
            type: "string",
            description: "流水归属（谁的收入/支出，例如：个人, 家庭, 公共）",
            example: "个人",
          },
          eliminate: {
            type: "number",
            description: "平账标志：0-未平账；1-已平账；-1-忽略平账",
            enum: [0, 1, -1],
            example: 0,
          },
        },
        // 注意：Flow 接口中的所有字段都是可选的 (带有 ?)，因此这里没有添加 required 字段。
        // 但在实际业务中，某些字段通常会是必填的，你可能需要根据业务需求调整。
      },

      // Budget 支出计划(预算)
      Budget: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "预算ID",
            example: 1,
          },
          userId: {
            type: "number",
            description: "预算所属用户ID",
            example: 1001,
          },
          bookId: {
            type: "string",
            description: "预算所属账本ID",
            example: "book-abc-123",
          },
          month: {
            type: "string",
            description: "预算所属月份 (YYYY-MM)",
            example: "2024-07",
          },
          budget: {
            type: "number",
            format: "float",
            description: "预算金额",
            example: 1000.0,
          },
          used: {
            type: "number",
            format: "float",
            description: "已使用金额",
            example: 350.75,
          },
        },
        // 根据你的接口定义，所有字段都是可选的
      },

      // 固定流水 (定期收入/支出)
      FixedFlow: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "固定流水ID",
            example: 1,
          },
          userId: {
            type: "number",
            description: "固定流水所属用户ID",
            example: 1001,
          },
          bookId: {
            type: "string",
            description: "固定流水所属账本ID",
            example: "book-abc-123",
          },
          startMonth: {
            type: "string",
            description: "开始生效月份 (YYYY-MM)",
            example: "2024-01",
          },
          endMonth: {
            type: "string",
            description: "结束生效月份 (YYYY-MM)",
            example: "2024-12",
          },
          month: {
            type: "string",
            description: "当前固定流水的月份 (用于记录当月生成情况)",
            example: "2024-07",
          },
          money: {
            type: "number",
            format: "float",
            description: "金额",
            example: 200.0,
          },
          name: {
            type: "string",
            description: "固定流水名称",
            example: "房租",
          },
          description: {
            type: "string",
            description: "备注/描述",
            example: "每月固定房租支出",
          },
          flowType: {
            type: "string",
            description: "流水类型：收入(in)、支出(out)、不计收支(zero)",
            enum: ["in", "out", "zero"],
            example: "out",
          },
          industryType: {
            type: "string",
            description: "行业分类（例如：居住, 交通等）",
            example: "居住",
          },
          payType: {
            type: "string",
            description: "支付方式/收款方式",
            example: "银行卡",
          },
          attribution: {
            type: "string",
            description: "流水归属（谁的收入/支出，例如：个人, 家庭）",
            example: "家庭",
          },
        },
        // 根据你的接口定义，所有字段都是可选的
      },

      // 类型关联 (例如：分类映射)
      TypeRelation: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "关联ID",
            example: 1,
          },
          userId: {
            type: "number",
            description: "所属用户ID",
            example: 1001,
          },
          bookId: {
            type: "string",
            description: "所属账本ID",
            example: "book-abc-123",
          },
          source: {
            type: "string",
            description: "源类型值 (例如：支付宝账单中的原始类别)",
            example: "餐饮娱乐",
          },
          target: {
            type: "string",
            description: "目标类型值 (映射到的系统内部类别)",
            example: "餐饮",
          },
          bookName: {
            type: "string",
            description: "账本名称 (用于显示，非数据库字段)",
            example: "家庭账本",
          },
          bookDbId: {
            type: "number",
            description: "账本数据库内部ID (用于显示，非数据库字段)",
            example: 1,
          },
        },
        required: ["id", "userId", "bookId", "source", "target"], // 'bookName' 和 'bookDbId' 是可选的
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
