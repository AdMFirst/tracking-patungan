/**
 * Instructions for AI machine:
 * Rule 1: prioritize the use of t from useI18n rather than $t
 * Rule 2: Use the file path as prefix for i18n key (e.g., files in @/components/room/OrderRooms.vue is components.room.OrderRooms.whateverYouWantAfterwards)
 * Rule 3: Also use i18n on error messages and placeholder text
 * Rule 4: when the text is combined with date or currency, do it last then ask on how to proceed
 */
const zh = {
    "components": {
        "auth": {
            "AuthForm": {
                "signInTitle": "登录您的账户",
                "createAccountTitle": "创建您的账户",
                "noAccount": "还没有账户？",
                "haveAccount": "已有账户？",
                "signUp": "注册",
                "signIn": "登录",
                "orContinueWith": "或继续使用",
                "emailLabel": "电子邮件",
                "passwordLabel": "密码",
                "hidePassword": "隐藏密码",
                "showPassword": "显示密码",
                "fullNameLabel": "全名",
                "emailPlaceholder": "输入您的电子邮件",
                "passwordPlaceholder": "输入您的密码",
                "fullNamePlaceholder": "输入您的全名",
                "loading": "加载中...",
                "signInButton": "登录",
                "signUpButton": "注册",
                "genericError": "发生错误。请重试。",
                "discordLoginError": "无法启动 Discord 登录。请重试。",
                "linkedInLoginError": "无法启动 LinkedIn 登录。请重试。"
            }
        },
        "common": {
            "BottomNav": {
                "home": "首页",
                "histori": "历史",
                "create": "创建",
                "my room": "我的房间",
                "profile": "个人资料"
            },
            "LoadingScreen": {
                "0": "正在传送您的仪表板...",
                "1": "正在准备您的工作区...",
                "2": "正在扫描您的交易...",
                "3": "正在安全地平衡账目...",
                "4": "正在验证付款详情...",
                "5": "正在追踪您的资金流向...",
                "6": "正在计算您的总额...",
                "7": "正在保护您的财务数据...",
                "8": "正在更新您的余额...",
                "9": "正在确认最近的付款...",
                "10": "正在分析支出模式...",
                "11": "正在同步银行连接...",
                "12": "正在生成您的报告...",
                "13": "正在锁定您的分类账...",
                "14": "正在预测您的现金流...",
                "15": "正在完成交易历史...",
            },
            "UserAvatar": {
                "connectedViaDiscord": "通过 Discord 连接",
                "connectedViaLinkedIn": "通过 LinkedIn 连接",
                "emailPassword": "电子邮件/密码",
                "unknown": "未知"
            }
        },
        "qr": {
            "QRScanner": {
                "alignQRCode": "将二维码对准框内",
                "statusLabel": "状态",
                "activeStatus": "活跃",
                "pausedStatus": "已暂停",
                "startButton": "开始",
                "stopButton": "停止"
            }
        },
        "room": {
            "JoinRoomPrompt": {
                "title": "您未参与此房间",
                "description": "此房间存在，但您尚未加入。您想加入并参与订单吗？",
                "noButton": "不，返回",
                "yesButton": "是，加入房间",
                "joining": "正在加入..."
            },
            "OrderRooms": {
                "untitledRoom": "无标题房间",
                "unknown": "未知",
                "notSpecified": "未指定",
                "roomStillOpen": "房间仍然开放！",
                "openRoomButton": "打开房间",
                "payNowButton": "立即支付",
                "yourTotal": "您的总额：",
                "runnerLabel": "跑腿：",
                "restaurantLabel": "餐厅：",
                "createdAtLabel": "创建于：",
                "itemsOrderedLabel": "已订购项目：",
                "each": "每个",
                "paidAt": "支付于 {date}",
                "paidAtVia": "通过 {method} 支付于 {date}",
                "paymentConfirmed": "已确认使用所选支付方式支付 {amount}。房间已标记为已支付。",
                "paymentFailed": "确认支付失败：{error}"
            },
            "QRScanDialog": {
                "scanQRButton": "扫描二维码",
                "title": "通过扫描二维码加入房间",
                "closeButton": "关闭"
            }
        },
        "modals": {
            "AddOrderItemModal": {
                "title": "添加新订单项目",
                "description": "为此房间添加新项目到您的订单。",
                "itemNameLabel": "项目名称",
                "itemNamePlaceholder": "输入项目名称",
                "quantityLabel": "数量",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "单价",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "备注（可选）",
                "notesPlaceholder": "任何特别说明",
                "cancelButton": "取消",
                "addItemButton": "添加项目"
            },
            "CloseRoomModal": {
                "title": "关闭房间",
                "description": "输入此房间的最终总额。",
                "finalTotalLabel": "最终总额",
                "finalTotalPlaceholder": "输入最终总额...",
                "cancelButton": "取消",
                "deleteRoomButton": "删除房间",
                "submitButton": "提交",
                "deleteConfirmTitle": "您确定吗？",
                "deleteConfirmDescription": "此操作无法撤销。所有房间数据将被永久删除。",
                "deleteCancelButton": "取消",
                "deleteConfirmButton": "删除"
            },
            "EditOrderItemModal": {
                "title": "编辑订单项目",
                "description": "编辑此订单项目。",
                "itemNameLabel": "项目名称",
                "itemNamePlaceholder": "输入项目名称",
                "quantityLabel": "数量",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "单价",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "备注（可选）",
                "notesPlaceholder": "任何特别说明",
                "cancelButton": "取消",
                "updateItemButton": "更新项目"
            },
            "FilterModal": {
                "title": "筛选",
                "description": "调整您的房间搜索标准。",
                "searchLabel": "按标题/名称搜索",
                "searchPlaceholder": "搜索房间...",
                "platformLabel": "平台",
                "platformPlaceholder": "所有平台",
                "restaurantLabel": "餐厅（特定）",
                "restaurantPlaceholder": "按特定餐厅筛选...",
                "dateFromLabel": "从日期",
                "dateToLabel": "到日期",
                "clearFiltersButton": "清除筛选",
                "applyFiltersButton": "应用筛选"
            },
            "PaymentModal": {
                "title": "支付方式",
                "description": "选择您的支付方式并确认支付",
                "availablePaymentMethods": "可用支付方式：",
                "loadingPaymentMethods": "正在加载支付方式...",
                "noPaymentMethods": "未找到此跑腿的支付方式。",
                "confirmPaymentCheckbox": "我确认我已使用所选支付方式支付此订单",
                "cancelButton": "取消",
                "confirmPaymentButton": "确认支付"
            },
            "SettingsModal": {
                "title": "设置",
                "description": "更新您的个人资料设置。",
                "usernameLabel": "用户名",
                "usernamePlaceholder": "输入您的用户名...",
                "cancelButton": "取消",
                "saveChangesButton": "保存更改"
            }
        },
        "UserInfo": {
            "welcomeBack": "欢迎回来！",
            "accountInfo": "您的账户信息",
            "connectedViaDiscord": "通过 Discord 连接",
            "connectedViaLinkedIn": "通过 LinkedIn 连接",
            "defaultUser": "用户",
            "memberSince": "加入时间",
            "lastSignIn": "上次登录",
            "accountStatus": "账户状态",
            "activeStatus": "活跃",
            "provider": "提供商",
            "discord": "Discord",
            "linkedIn": "LinkedIn",
            "noUserInfo": "无用户信息",
            "signingOut": "正在退出...",
            "signOut": "退出"
        }
    },
    "pages": {
        "404": {
            "pageNotFound": "页面未找到",
            "description": "您输入的地址似乎不存在。别担心，让我们带您回到正轨。",
            "goToHomepage": "前往首页"
        },
        "index": {
            "appName": "Talangin",
            "heroSubtitle": "让分摊账单变得透明",
            "heroDescription": "记录。计算。完成。",
            "joinRoom": "加入房间",
            "enterRoomCode": "输入房间代码",
            "go": "前往",
            "monthlySpending": "每月支出",
            "noSpendingData": "无支出数据",
            "dashboardFeatures": "仪表板功能",
            "trackExpenses": "追踪您的支出",
            "viewAnalytics": "查看分析",
            "manageBudgets": "管理预算"
        },
        "createRoom": {
            "title": "创建新房间",
            "description": "输入您的外卖订单页面详情。",
            "form": {
                "titleLabel": "标题",
                "titlePlaceholder": "与父母共进晚餐",
                "restaurantLabel": "餐厅名称",
                "restaurantPlaceholder": "肯德基, 麦当劳, 等",
                "deliveryTypeLabel": "配送类型",
                "deliveryTypePlaceholder": "选择应用",
                "customPlatformLabel": "自定义平台名称",
                "customPlatformPlaceholder": "例如，本地配送服务",
                "createButton": "创建",
                "loading": "加载中..."
            },
            "deliveryTypes": {
                "goFood": "GoFood",
                "grabFood": "GrabFood",
                "shopeeFood": "Shopee Food",
                "travelokaEats": "Traveloka Eats",
                "maxim": "Maxim Food & Goods Delivery",
                "tokopediaNow": "Tokopedia NOW!",
                "custom": "自定义"
            },
            "errors": {
                "connectionError": "连接服务器失败。"
            }
        },
        "myroom": {
            "roomDetails": {
                "title": "房间详情",
                "restaurant": "餐厅",
                "orderTime": "订单时间",
                "created": "创建于",
                "finalTotal": "最终总额",
                "participants": "参与者",
                "paymentSummary": "支付摘要",
                "totalPaid": "已付总额",
                "totalUnpaid": "未付总额",
                "remaining": "剩余",
                "roomNotFound": "房间未找到",
                "roomNotFoundDescription": "您正在寻找的房间不存在。",
                "notSpecified": "未指定",
                "unknownUser": "未知用户",
                "paid": "已付",
                "pending": "待定",
                "unpaid": "未付",
                "you": "您",
                "via": "通过",
                "noParticipants": "未找到参与者。"
            },
            "index": {
                "title": "我的房间",
                "openFilters": "打开筛选",
                "noRoomsFound": "未找到房间",
                "noRoomsMatchFilters": "没有房间符合您当前的筛选条件。",
                "noRoomsCreated": "您尚未创建任何房间。",
                "untitledRoom": "无标题房间",
                "unknown": "未知",
                "notSpecified": "未指定",
                "restaurantLabel": "餐厅：",
                "orderTimeLabel": "订单时间：",
                "createdLabel": "创建于：",
                "finalTotalLabel": "最终总额：",
                "manageRoom": "管理房间",
                "roomStillOpen": "房间依然热闹！快来添加您的订单",
                "closeRoom": "关闭房间",
                "openRoom": "打开房间"
            }
        },
        "activeRoom": {
            "errorTitle": "错误",
            "goBack": "返回",
            "roomNotAvailableTitle": "房间不可用",
            "roomNotAvailableDescription": "{roomId} 无效或不活跃",
            "thisRoom": "此房间",
            "restaurantInfo": "{restaurant} 通过 {platform}",
            "cartTitle": "购物车",
            "unknownUser": "未知用户",
            "each": "每个",
            "noOrderItems": "暂无订单项目。",
            "shareRoomTitle": "分享房间",
            "shareRoomDescription": "扫描二维码与他人分享此房间。",
            "close": "关闭",
            "errors": {
                "loginToJoin": "您需要登录才能加入此房间",
                "joinFailed": "加入房间失败。请重试。",
                "participantRequired": "您需要成为参与者才能添加项目",
                "addFailed": "添加订单项目失败。请重试。",
                "notParticipant": "您不是此房间的参与者。",
                "editOwnItems": "您只能编辑自己的项目",
                "loginToUpdate": "您需要登录才能更新订单项目",
                "updateFailed": "更新订单项目失败。",
                "loginToDelete": "您需要登录才能删除订单项目",
                "deleteOwnItems": "您只能删除自己的项目",
                "deleteFailed": "删除订单项目失败。",
                "invalidUuid": "房间 ID 格式无效。",
                "loadDetailsFailed": "加载房间详情失败。",
                "roomNotFound": "房间未找到。请检查房间 ID。",
                "roomClosed": "此房间已关闭。只能访问活跃房间。",
                "loadParticipantsFailed": "加载参与者失败。",
                "loadItemsFailed": "加载订单项目失败。",
                "checkParticipationFailed": "检查参与状态失败。",
                "loadDataFailed": "加载房间数据失败。",
                "generateQrFailed": "生成二维码失败。"
            },
            "toast": {
                "deleteConfirm": "删除此订单项目？",
                "delete": "删除",
                "cancel": "取消"
            }
        },
        "histori": {
            "title": "已加入房间历史",
            "tabs": {
                "active": "活跃",
                "closed": "已关闭"
            },
            "emptyState": {
                "activeTitle": "未找到活跃房间",
                "closedTitle": "未找到已关闭房间",
                "activeDescription": "您尚未参与任何活跃房间。",
                "closedDescription": "您尚未参与任何已关闭房间。"
            }
        },
        "profile": {
            "index": {
                "memberSince": "加入时间",
                "lastSignIn": "上次登录",
                "provider": "提供商",
                "noUserInfo": "无用户信息",
                "changeUsername": "更改用户名",
                "managePaymentMethods": "管理支付方式",
                "changeLanguage": "更改语言",
                "selectPreferredLanguage": "选择您喜欢的语言",
                "language": "语言",
                "selectLanguage": "选择语言",
                "save": "保存",
                "cancel": "取消",
                "signingOut": "正在退出...",
                "signOut": "退出"
            },
            "mypayment": {
                "title": "我的支付方式",
                "addPaymentMethod": "添加支付方式",
                "noPaymentMethodsYet": "暂无支付方式",
                "addPaymentMethodDescription": "添加支付方式以接收参与者的付款",
                "addedOn": "添加于",
                "edit": "编辑",
                "delete": "删除",
                "add": "添加",
                "paymentMethod": "支付方式",
                "paymentType": "支付类型",
                "selectPaymentType": "选择支付类型",
                "bankTransfer": "银行转账",
                "goPay": "GoPay",
                "ovo": "OVO",
                "dana": "Dana",
                "shopeePay": "ShopeePay",
                "bankName": "银行名称",
                "bankNamePlaceholder": "例如，中国银行，工商银行",
                "accountNumber": "账号",
                "accountNumberPlaceholder": "输入账号",
                "cancel": "取消",
                "update": "更新",
                "save": "保存",
                "deletePaymentMethod": "删除支付方式",
                "deleteConfirm": "您确定要删除此支付方式吗？",
                "errors": {
                    "saveFailed": "保存支付方式失败：{error}",
                    "deleteFailed": "删除支付方式失败：{error}"
                }
            }
        }
    }
};

export default zh;