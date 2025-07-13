// Mermaid 模板数据
export const templates = {
  blank: {
    name: '空白模板',
    description: '从空白开始创建',
    icon: '+',
    code: '',
  },
  flowchart: {
    name: '流程图',
    description: '创建流程图和决策树',
    icon: '📊',
    code: `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
    E --> F[完成]`,
  },
  sequence: {
    name: '时序图',
    description: '展示系统交互时序',
    icon: '⏱️',
    code: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 发送请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 响应请求`,
  },
  class: {
    name: '类图',
    description: '设计类和对象关系',
    icon: '🏗️',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    class Cat {
        +String color
        +meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  state: {
    name: '状态图',
    description: '描述状态转换流程',
    icon: '🔄',
    code: `stateDiagram-v2
    [*] --> 待机
    待机 --> 运行: 启动
    运行 --> 暂停: 暂停
    暂停 --> 运行: 恢复
    运行 --> 停止: 停止
    停止 --> [*]`,
  },
  gantt: {
    name: '甘特图',
    description: '项目进度和时间管理',
    icon: '📅',
    code: `gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析    :done, des1, 2024-01-01, 2024-01-07
    系统设计    :active, des2, 2024-01-08, 2024-01-15
    section 开发阶段
    前端开发    :dev1, 2024-01-16, 2024-01-30
    后端开发    :dev2, 2024-01-20, 2024-02-10
    section 测试阶段
    单元测试    :test1, 2024-02-11, 2024-02-20
    集成测试    :test2, 2024-02-21, 2024-03-01`,
  },
};

// 获取模板列表
export function getTemplateList() {
  return Object.entries(templates).map(([key, template]) => ({
    id: key,
    ...template,
  }));
}

// 根据模板ID获取模板
export function getTemplate(templateId) {
  return templates[templateId];
}
