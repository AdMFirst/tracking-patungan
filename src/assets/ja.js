/**
 * Instructions for AI machine:
 * Rule 1: prioritize the use of t from useI18n rather than $t
 * Rule 2: Use the file path as prefix for i18n key (e.g., files in @/components/room/OrderRooms.vue is components.room.OrderRooms.whateverYouWantAfterwards)
 * Rule 3: Also use i18n on error messages and placeholder text
 * Rule 4: when the text is combined with date or currency, do it last then ask on how to proceed
 */
const ja = {
    "components": {
        "auth": {
            "AuthForm": {
                "signInTitle": "アカウントにログイン",
                "createAccountTitle": "アカウントを作成",
                "noAccount": "アカウントをお持ちでないですか？",
                "haveAccount": "すでにアカウントをお持ちですか？",
                "signUp": "サインアップ",
                "signIn": "サインイン",
                "orContinueWith": "または次で続行",
                "emailLabel": "メールアドレス",
                "passwordLabel": "パスワード",
                "hidePassword": "パスワードを隠す",
                "showPassword": "パスワードを表示",
                "fullNameLabel": "氏名",
                "emailPlaceholder": "メールアドレスを入力",
                "passwordPlaceholder": "パスワードを入力",
                "fullNamePlaceholder": "氏名を入力",
                "loading": "読み込み中...",
                "signInButton": "サインイン",
                "signUpButton": "サインアップ",
                "genericError": "エラーが発生しました。もう一度お試しください。",
                "discordLoginError": "Discordログインの開始に失敗しました。もう一度お試しください。",
                "linkedInLoginError": "LinkedInログインの開始に失敗しました。もう一度お試しください。"
            }
        },
        "common": {
            "BottomNav": {
                "home": "ホーム",
                "histori": "履歴",
                "create": "作成",
                "my room": "マイルーム",
                "profile": "プロフィール"
            },
            "LoadingScreen": {
                "0": "ダッシュボードを配信中...",
                "1": "ワークスペースを準備中...",
                "2": "取引をスキャン中...",
                "3": "帳簿を安全に調整中...",
                "4": "支払い詳細を確認中...",
                "5": "資金の流れを追跡中...",
                "6": "合計を計算中...",
                "7": "財務データを保護中...",
                "8": "残高を更新中...",
                "9": "最近の支払いを確認中...",
                "10": "支出パターンを分析中...",
                "11": "銀行接続を同期中...",
                "12": "レポートを作成中...",
                "13": "台帳をロック中...",
                "14": "キャッシュフローを予測中...",
                "15": "取引履歴を完了中...",
            },
            "UserAvatar": {
                "connectedViaDiscord": "Discord経由で接続",
                "connectedViaLinkedIn": "LinkedIn経由で接続",
                "emailPassword": "メール/パスワード",
                "unknown": "不明"
            }
        },
        "qr": {
            "QRScanner": {
                "alignQRCode": "QRコードを枠内に合わせてください",
                "statusLabel": "ステータス",
                "activeStatus": "アクティブ",
                "pausedStatus": "一時停止",
                "startButton": "開始",
                "stopButton": "停止"
            }
        },
        "room": {
            "JoinRoomPrompt": {
                "title": "このルームに参加していません",
                "description": "このルームは存在しますが、まだ参加していません。参加して注文しますか？",
                "noButton": "いいえ、戻る",
                "yesButton": "はい、参加する",
                "joining": "参加中..."
            },
            "OrderRooms": {
                "untitledRoom": "無題のルーム",
                "unknown": "不明",
                "notSpecified": "未指定",
                "roomStillOpen": "ルームはまだ開いています！",
                "openRoomButton": "ルームを開く",
                "payNowButton": "今すぐ支払う",
                "yourTotal": "合計:",
                "runnerLabel": "ランナー:",
                "restaurantLabel": "レストラン:",
                "createdAtLabel": "作成日時:",
                "itemsOrderedLabel": "注文アイテム:",
                "each": "各",
                "paidAt": "{date}に支払い済み",
                "paidAtVia": "{date}に{method}経由で支払い済み",
                "paymentConfirmed": "選択された支払い方法で{amount}の支払いが確認されました。ルームは支払い済みとしてマークされました。",
                "paymentFailed": "支払いの確認に失敗しました: {error}"
            },
            "QRScanDialog": {
                "scanQRButton": "QRスキャン",
                "title": "QRコードをスキャンしてルームに参加",
                "closeButton": "閉じる"
            }
        },
        "modals": {
            "AddOrderItemModal": {
                "title": "注文アイテムを追加",
                "description": "このルームの注文に新しいアイテムを追加します。",
                "itemNameLabel": "アイテム名",
                "itemNamePlaceholder": "アイテム名を入力",
                "quantityLabel": "数量",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "単価",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "メモ（任意）",
                "notesPlaceholder": "特別な指示",
                "cancelButton": "キャンセル",
                "addItemButton": "アイテムを追加"
            },
            "CloseRoomModal": {
                "title": "ルームを閉じる",
                "description": "このルームの最終合計を入力してください。",
                "finalTotalLabel": "最終合計",
                "finalTotalPlaceholder": "最終合計を入力...",
                "cancelButton": "キャンセル",
                "deleteRoomButton": "ルームを削除",
                "submitButton": "送信",
                "deleteConfirmTitle": "よろしいですか？",
                "deleteConfirmDescription": "この操作は取り消せません。すべてのルームデータは完全に削除されます。",
                "deleteCancelButton": "キャンセル",
                "deleteConfirmButton": "削除"
            },
            "EditOrderItemModal": {
                "title": "注文アイテムを編集",
                "description": "この注文アイテムを編集します。",
                "itemNameLabel": "アイテム名",
                "itemNamePlaceholder": "アイテム名を入力",
                "quantityLabel": "数量",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "単価",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "メモ（任意）",
                "notesPlaceholder": "特別な指示",
                "cancelButton": "キャンセル",
                "updateItemButton": "アイテムを更新"
            },
            "FilterModal": {
                "title": "フィルター",
                "description": "ルームの検索条件を調整します。",
                "searchLabel": "タイトル/名前で検索",
                "searchPlaceholder": "ルームを検索...",
                "platformLabel": "プラットフォーム",
                "platformPlaceholder": "すべてのプラットフォーム",
                "restaurantLabel": "レストラン（特定）",
                "restaurantPlaceholder": "特定のレストランでフィルタリング...",
                "dateFromLabel": "開始日",
                "dateToLabel": "終了日",
                "clearFiltersButton": "フィルターをクリア",
                "applyFiltersButton": "フィルターを適用"
            },
            "PaymentModal": {
                "title": "支払い方法",
                "description": "支払い方法を選択して支払いを確定してください",
                "availablePaymentMethods": "利用可能な支払い方法:",
                "loadingPaymentMethods": "支払い方法を読み込み中...",
                "noPaymentMethods": "このランナーの支払い方法が見つかりません。",
                "confirmPaymentCheckbox": "選択した支払い方法でこの注文の支払いを完了したことを確認します",
                "cancelButton": "キャンセル",
                "confirmPaymentButton": "支払いを確定"
            },
            "SettingsModal": {
                "title": "設定",
                "description": "プロフィール設定を更新します。",
                "usernameLabel": "ユーザー名",
                "usernamePlaceholder": "ユーザー名を入力...",
                "cancelButton": "キャンセル",
                "saveChangesButton": "変更を保存"
            }
        },
        "UserInfo": {
            "welcomeBack": "お帰りなさい！",
            "accountInfo": "アカウント情報",
            "connectedViaDiscord": "Discord経由で接続",
            "connectedViaLinkedIn": "LinkedIn経由で接続",
            "defaultUser": "ユーザー",
            "memberSince": "登録日",
            "lastSignIn": "最終ログイン",
            "accountStatus": "アカウントステータス",
            "activeStatus": "アクティブ",
            "provider": "プロバイダー",
            "discord": "Discord",
            "linkedIn": "LinkedIn",
            "noUserInfo": "ユーザー情報がありません",
            "signingOut": "サインアウト中...",
            "signOut": "サインアウト"
        }
    },
    "pages": {
        "404": {
            "pageNotFound": "ページが見つかりません",
            "description": "入力したアドレスは存在しないようです。心配しないでください、正しい場所に戻りましょう。",
            "goToHomepage": "ホームページへ"
        },
        "index": {
            "appName": "Talangin",
            "heroSubtitle": "割り勘を透明にする",
            "heroDescription": "記録。計算。完了。",
            "joinRoom": "ルームに参加",
            "enterRoomCode": "ルームコードを入力",
            "go": "進む",
            "monthlySpending": "月間支出",
            "noSpendingData": "支出データがありません",
            "dashboardFeatures": "ダッシュボード機能",
            "trackExpenses": "支出を追跡",
            "viewAnalytics": "分析を表示",
            "manageBudgets": "予算を管理"
        },
        "createRoom": {
            "title": "新しいルームを作成",
            "description": "フードデリバリー注文ページの詳細を入力してください。",
            "form": {
                "titleLabel": "タイトル",
                "titlePlaceholder": "両親との夕食",
                "restaurantLabel": "レストラン名",
                "restaurantPlaceholder": "KFC, マクドナルド, など",
                "deliveryTypeLabel": "配達タイプ",
                "deliveryTypePlaceholder": "アプリを選択",
                "customPlatformLabel": "カスタムプラットフォーム名",
                "customPlatformPlaceholder": "例: 地元の配達サービス",
                "createButton": "作成",
                "loading": "読み込み中..."
            },
            "deliveryTypes": {
                "goFood": "GoFood",
                "grabFood": "GrabFood",
                "shopeeFood": "Shopee Food",
                "travelokaEats": "Traveloka Eats",
                "maxim": "Maxim Food & Goods Delivery",
                "tokopediaNow": "Tokopedia NOW!",
                "custom": "カスタム"
            },
            "errors": {
                "connectionError": "サーバーへの接続に失敗しました。"
            }
        },
        "myroom": {
            "roomDetails": {
                "title": "ルーム詳細",
                "restaurant": "レストラン",
                "orderTime": "注文時間",
                "created": "作成日",
                "finalTotal": "最終合計",
                "participants": "参加者",
                "paymentSummary": "支払い概要",
                "totalPaid": "支払い済み合計",
                "totalUnpaid": "未払い合計",
                "remaining": "残り",
                "roomNotFound": "ルームが見つかりません",
                "roomNotFoundDescription": "お探しのルームは存在しません。",
                "notSpecified": "未指定",
                "unknownUser": "不明なユーザー",
                "paid": "支払い済み",
                "pending": "保留中",
                "unpaid": "未払い",
                "you": "あなた",
                "via": "経由",
                "noParticipants": "参加者が見つかりません。"
            },
            "index": {
                "title": "マイルーム",
                "openFilters": "フィルターを開く",
                "noRoomsFound": "ルームが見つかりません",
                "noRoomsMatchFilters": "現在のフィルターに一致するルームはありません。",
                "noRoomsCreated": "まだルームを作成していません。",
                "untitledRoom": "無題のルーム",
                "unknown": "不明",
                "notSpecified": "未指定",
                "restaurantLabel": "レストラン:",
                "orderTimeLabel": "注文時間:",
                "createdLabel": "作成日:",
                "finalTotalLabel": "最終合計:",
                "manageRoom": "ルーム管理",
                "roomStillOpen": "ルームはまだ賑わっています！参加して注文を追加しましょう",
                "closeRoom": "ルームを閉じる",
                "openRoom": "ルームを開く"
            }
        },
        "activeRoom": {
            "errorTitle": "エラー",
            "goBack": "戻る",
            "roomNotAvailableTitle": "ルーム利用不可",
            "roomNotAvailableDescription": "{roomId} は無効または非アクティブです",
            "thisRoom": "このルーム",
            "restaurantInfo": "{platform} 経由の {restaurant}",
            "cartTitle": "カート",
            "unknownUser": "不明なユーザー",
            "each": "各",
            "noOrderItems": "注文アイテムはまだありません。",
            "shareRoomTitle": "ルームを共有",
            "shareRoomDescription": "QRコードをスキャンしてこのルームを他の人と共有します。",
            "close": "閉じる",
            "errors": {
                "loginToJoin": "このルームに参加するにはログインが必要です",
                "joinFailed": "ルームへの参加に失敗しました。もう一度お試しください。",
                "participantRequired": "アイテムを追加するには参加者である必要があります",
                "addFailed": "注文アイテムの追加に失敗しました。もう一度お試しください。",
                "notParticipant": "あなたはこのルームの参加者ではありません。",
                "editOwnItems": "自分のアイテムのみ編集できます",
                "loginToUpdate": "注文アイテムを更新するにはログインが必要です",
                "updateFailed": "注文アイテムの更新に失敗しました。",
                "loginToDelete": "注文アイテムを削除するにはログインが必要です",
                "deleteOwnItems": "自分のアイテムのみ削除できます",
                "deleteFailed": "注文アイテムの削除に失敗しました。",
                "invalidUuid": "ルームIDの形式が無効です。",
                "loadDetailsFailed": "ルーム詳細の読み込みに失敗しました。",
                "roomNotFound": "ルームが見つかりません。ルームIDを確認してください。",
                "roomClosed": "このルームは閉鎖されています。アクティブなルームのみアクセス可能です。",
                "loadParticipantsFailed": "参加者の読み込みに失敗しました。",
                "loadItemsFailed": "注文アイテムの読み込みに失敗しました。",
                "checkParticipationFailed": "参加ステータスの確認に失敗しました。",
                "loadDataFailed": "ルームデータの読み込みに失敗しました。",
                "generateQrFailed": "QRコードの生成に失敗しました。"
            },
            "toast": {
                "deleteConfirm": "この注文アイテムを削除しますか？",
                "delete": "削除",
                "cancel": "キャンセル"
            }
        },
        "histori": {
            "title": "参加したルームの履歴",
            "tabs": {
                "active": "アクティブ",
                "closed": "閉鎖済み"
            },
            "emptyState": {
                "activeTitle": "アクティブなルームが見つかりません",
                "closedTitle": "閉鎖されたルームが見つかりません",
                "activeDescription": "まだアクティブなルームに参加していません。",
                "closedDescription": "まだ閉鎖されたルームに参加していません。"
            }
        },
        "profile": {
            "index": {
                "memberSince": "登録日",
                "lastSignIn": "最終ログイン",
                "provider": "プロバイダー",
                "noUserInfo": "ユーザー情報がありません",
                "changeUsername": "ユーザー名を変更",
                "managePaymentMethods": "支払い方法を管理",
                "changeLanguage": "言語を変更",
                "selectPreferredLanguage": "希望の言語を選択してください",
                "language": "言語",
                "selectLanguage": "言語を選択",
                "save": "保存",
                "cancel": "キャンセル",
                "signingOut": "サインアウト中...",
                "signOut": "サインアウト"
            },
            "mypayment": {
                "title": "私の支払い方法",
                "addPaymentMethod": "支払い方法を追加",
                "noPaymentMethodsYet": "支払い方法はまだありません",
                "addPaymentMethodDescription": "参加者からの支払いを受け取るための支払い方法を追加します",
                "addedOn": "追加日",
                "edit": "編集",
                "delete": "削除",
                "add": "追加",
                "paymentMethod": "支払い方法",
                "paymentType": "支払いタイプ",
                "selectPaymentType": "支払いタイプを選択",
                "bankTransfer": "銀行振込",
                "goPay": "GoPay",
                "ovo": "OVO",
                "dana": "Dana",
                "shopeePay": "ShopeePay",
                "bankName": "銀行名",
                "bankNamePlaceholder": "例: 三菱UFJ, 三井住友, みずほ",
                "accountNumber": "口座番号",
                "accountNumberPlaceholder": "口座番号を入力",
                "cancel": "キャンセル",
                "update": "更新",
                "save": "保存",
                "deletePaymentMethod": "支払い方法を削除",
                "deleteConfirm": "この支払い方法を削除してもよろしいですか？",
                "errors": {
                    "saveFailed": "支払い方法の保存に失敗しました: {error}",
                    "deleteFailed": "支払い方法の削除に失敗しました: {error}"
                }
            }
        }
    }
};

export default ja;