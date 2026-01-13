/**
 * Instructions for AI machine:
 * Rule 1: prioritize the use of t from useI18n rather than $t
 * Rule 2: Use the file path as prefix for i18n key (e.g., files in @/components/room/OrderRooms.vue is components.room.OrderRooms.whateverYouWantAfterwards)
 * Rule 3: Also use i18n on error messages and placeholder text
 * Rule 4: when the text is combined with date or currency, do it last then ask on how to proceed
 */
const su = {
    "components": {
        "auth": {
            "AuthForm": {
                "signInTitle": "Lebet kana akun anjeun",
                "createAccountTitle": "Damel akun anjeun",
                "noAccount": "Teu acan gaduh akun?",
                "haveAccount": "Atos gaduh akun?",
                "signUp": "Daptar",
                "signIn": "Lebet",
                "orContinueWith": "Atanapi lajengkeun sareng",
                "emailLabel": "Email",
                "passwordLabel": "Kecap Sandi",
                "hidePassword": "Sumputkeun sandi",
                "showPassword": "Tembongkeun sandi",
                "fullNameLabel": "Nami Lengkep",
                "emailPlaceholder": "Lebetkeun email anjeun",
                "passwordPlaceholder": "Lebetkeun kecap sandi anjeun",
                "fullNamePlaceholder": "Lebetkeun nami lengkep anjeun",
                "loading": "Ngamuat...",
                "signInButton": "Lebet",
                "signUpButton": "Daptar",
                "genericError": "Aya kasalahan. Cobian deui.",
                "discordLoginError": "Gagal lebet nganggo Discord. Cobian deui.",
                "linkedInLoginError": "Gagal lebet nganggo LinkedIn. Cobian deui."
            }
        },
        "common": {
            "BottomNav": {
                "home": "Beranda",
                "histori": "Riwayat",
                "create": "Damel",
                "my room": "Kamar Abdi",
                "profile": "Profil"
            },
            "LoadingScreen": {
                "0": "Ngirimkeun dasbor anjeun...",
                "1": "Nyiapkeun ruang damel...",
                "2": "Mindai transaksi...",
                "3": "Nyeimbangkeun buku...",
                "4": "Verifikasi rincian mayar...",
                "5": "Nglacak arus dana...",
                "6": "Ngitung total...",
                "7": "Ngamankeun data kauangan...",
                "8": "Nganyarkeun saldo...",
                "9": "Konfirmasi pamayaran...",
                "10": "Analisis pengeluaran...",
                "11": "Nyinkronkeun koneksi bank...",
                "12": "Damel laporan...",
                "13": "Ngunci buku besar...",
                "14": "Perkiraan arus kas...",
                "15": "Ngrampungkeun riwayat transaksi...",
            },
            "UserAvatar": {
                "connectedViaDiscord": "Nyambung via Discord",
                "connectedViaLinkedIn": "Nyambung via LinkedIn",
                "emailPassword": "Email/Sandi",
                "unknown": "Teu Diterangkeun"
            }
        },
        "qr": {
            "QRScanner": {
                "alignQRCode": "Pas-keun kode QR dina bingkai",
                "statusLabel": "Status",
                "activeStatus": "Aktif",
                "pausedStatus": "Jeda",
                "startButton": "Mulai",
                "stopButton": "Eureun"
            }
        },
        "room": {
            "JoinRoomPrompt": {
                "title": "Anjeun teu acan lebet kamar ieu",
                "description": "Kamar ieu aya tapi anjeun teu acan gabung. Bade gabung sareng pesen?",
                "noButton": "Henteu, wangsul",
                "yesButton": "Enya, gabung",
                "joining": "Gabung..."
            },
            "OrderRooms": {
                "untitledRoom": "Kamar Tanpa Judul",
                "unknown": "Teu Diterangkeun",
                "notSpecified": "Teu ditangtukeun",
                "roomStillOpen": "Kamar masih buka!",
                "openRoomButton": "Buka Kamar",
                "payNowButton": "Bayar Ayeuna",
                "yourTotal": "Total anjeun:",
                "runnerLabel": "Pelari:",
                "restaurantLabel": "Restoran:",
                "createdAtLabel": "Didamel:",
                "itemsOrderedLabel": "Item Dipesen:",
                "each": "hiji",
                "paidAt": "Dibayar tanggal {date}",
                "paidAtVia": "Dibayar tanggal {date} via {method}",
                "paymentConfirmed": "Pamayaran dikonfirmasi {amount} nganggo metode nu dipilih. Kamar parantos lunas.",
                "paymentFailed": "Gagal konfirmasi pamayaran: {error}"
            },
            "QRScanDialog": {
                "scanQRButton": "Pindai QR",
                "title": "Gabung kamar ku mindai QR",
                "closeButton": "Tutup"
            }
        },
        "modals": {
            "AddOrderItemModal": {
                "title": "Tambah Item Pesenan Anyar",
                "description": "Tambahkeun item anyar kana pesenan anjeun.",
                "itemNameLabel": "Nami Item",
                "itemNamePlaceholder": "Lebetkeun nami item",
                "quantityLabel": "Jumlah",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "Harga Satuan",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "Catetan (opsional)",
                "notesPlaceholder": "Instruksi khusus",
                "cancelButton": "Batal",
                "addItemButton": "Tambah Item"
            },
            "CloseRoomModal": {
                "title": "Tutup Kamar",
                "description": "Lebetkeun total akhir kanggo kamar ieu.",
                "finalTotalLabel": "Total Akhir",
                "finalTotalPlaceholder": "Lebetkeun total akhir...",
                "cancelButton": "Batal",
                "deleteRoomButton": "Hapus Kamar",
                "submitButton": "Kirim",
                "deleteConfirmTitle": "Yakin bade dihapus?",
                "deleteConfirmDescription": "Tindakan ieu teu tiasa dibatalkeun. Sadaya data kamar bakal ical.",
                "deleteCancelButton": "Batal",
                "deleteConfirmButton": "Hapus"
            },
            "EditOrderItemModal": {
                "title": "Ubah Item Pesenan",
                "description": "Ubah item pesenan ieu.",
                "itemNameLabel": "Nami Item",
                "itemNamePlaceholder": "Lebetkeun nami item",
                "quantityLabel": "Jumlah",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "Harga Satuan",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "Catetan (opsional)",
                "notesPlaceholder": "Instruksi khusus",
                "cancelButton": "Batal",
                "updateItemButton": "Perbarui Item"
            },
            "FilterModal": {
                "title": "Saringan",
                "description": "Atur kriteria milarian kamar.",
                "searchLabel": "Milarian dumasar judul/nami",
                "searchPlaceholder": "Milarian kamar...",
                "platformLabel": "Platform",
                "platformPlaceholder": "Sadaya Platform",
                "restaurantLabel": "Restoran (Khusus)",
                "restaurantPlaceholder": "Saring dumasar restoran...",
                "dateFromLabel": "Ti Tanggal",
                "dateToLabel": "Dugi Tanggal",
                "clearFiltersButton": "Hapus Saringan",
                "applyFiltersButton": "Terapkeun Saringan"
            },
            "PaymentModal": {
                "title": "Metode Pamayaran",
                "description": "Pilih metode pamayaran sareng konfirmasi",
                "availablePaymentMethods": "Metode Pamayaran:",
                "loadingPaymentMethods": "Ngamuat metode pamayaran...",
                "noPaymentMethods": "Teu aya metode pamayaran.",
                "confirmPaymentCheckbox": "Abdi konfirmasi yen abdi parantos mayar",
                "cancelButton": "Batal",
                "confirmPaymentButton": "Konfirmasi Pamayaran"
            },
            "SettingsModal": {
                "title": "Setelan",
                "description": "Perbarui setelan profil anjeun.",
                "usernameLabel": "Nami Pamake",
                "usernamePlaceholder": "Lebetkeun nami pamake...",
                "cancelButton": "Batal",
                "saveChangesButton": "Simpen Parobahan"
            }
        },
        "UserInfo": {
            "welcomeBack": "Wilujeng sumping deui!",
            "accountInfo": "Informasi akun anjeun",
            "connectedViaDiscord": "Nyambung via Discord",
            "connectedViaLinkedIn": "Nyambung via LinkedIn",
            "defaultUser": "Pamake",
            "memberSince": "Anggota ti",
            "lastSignIn": "Terakhir lebet",
            "accountStatus": "Status akun",
            "activeStatus": "Aktif",
            "provider": "Penyedia",
            "discord": "Discord",
            "linkedIn": "LinkedIn",
            "noUserInfo": "Teu aya informasi pamake",
            "signingOut": "Kaluar...",
            "signOut": "Kaluar"
        }
    },
    "pages": {
        "404": {
            "pageNotFound": "Kaca Teu Kapendak",
            "description": "Alamat nu anjeun ketik teu aya. Tong hariwang, hayu wangsul.",
            "goToHomepage": "Ka Beranda"
        },
        "index": {
            "appName": "Talangin",
            "heroSubtitle": "Jieun patungan jadi transparan",
            "heroDescription": "Catet. Itung. Beres.",
            "joinRoom": "Gabung Kamar",
            "enterRoomCode": "Lebetkeun kode kamar",
            "go": "Lanjut",
            "monthlySpending": "Pangeluaran Bulanan",
            "noSpendingData": "Teu aya data pangeluaran",
            "dashboardFeatures": "Fitur Dasbor",
            "trackExpenses": "Lacak pangeluaran",
            "viewAnalytics": "Tingali analitik",
            "manageBudgets": "Atur anggaran"
        },
        "createRoom": {
            "title": "Damel Kamar Anyar",
            "description": "Lebetkeun rincian kanggo pesenan tuangeun.",
            "form": {
                "titleLabel": "Judul",
                "titlePlaceholder": "Tuang wengi sareng sepuh",
                "restaurantLabel": "Nami Restoran",
                "restaurantPlaceholder": "KFC, McDonalds, jsb",
                "deliveryTypeLabel": "Tipe Pangiriman",
                "deliveryTypePlaceholder": "Pilih Aplikasi",
                "customPlatformLabel": "Nami Platform Khusus",
                "customPlatformPlaceholder": "Cth., Jasa Kirim Lokal",
                "createButton": "Damel",
                "loading": "Ngamuat..."
            },
            "deliveryTypes": {
                "goFood": "GoFood",
                "grabFood": "GrabFood",
                "shopeeFood": "Shopee Food",
                "travelokaEats": "Traveloka Eats",
                "maxim": "Maxim Food & Goods Delivery",
                "tokopediaNow": "Tokopedia NOW!",
                "custom": "Khusus"
            },
            "errors": {
                "connectionError": "Gagal nyambung ka server."
            }
        },
        "myroom": {
            "roomDetails": {
                "title": "Rincian Kamar",
                "restaurant": "Restoran",
                "orderTime": "Waktos Pesen",
                "created": "Didamel",
                "finalTotal": "Total Akhir",
                "participants": "Peserta",
                "paymentSummary": "Ringkesan Pamayaran",
                "totalPaid": "Total Dibayar",
                "totalUnpaid": "Total Teu Acan Dibayar",
                "remaining": "Sisa",
                "roomNotFound": "Kamar teu kapendak",
                "roomNotFoundDescription": "Kamar nu dipilarian teu aya.",
                "notSpecified": "Teu ditangtukeun",
                "unknownUser": "Pamake Teu Diterangkeun",
                "paid": "Lunas",
                "pending": "Ngantosan",
                "unpaid": "Teu Acan Lunas",
                "you": "Anjeun",
                "via": "via",
                "noParticipants": "Teu aya peserta."
            },
            "index": {
                "title": "Kamar Abdi",
                "openFilters": "Buka Saringan",
                "noRoomsFound": "Teu aya kamar",
                "noRoomsMatchFilters": "Teu aya kamar nu cocog.",
                "noRoomsCreated": "Anjeun teu acan damel kamar.",
                "untitledRoom": "Kamar Tanpa Judul",
                "unknown": "Teu Diterangkeun",
                "notSpecified": "Teu ditangtukeun",
                "restaurantLabel": "Restoran:",
                "orderTimeLabel": "Waktos Pesen:",
                "createdLabel": "Didamel:",
                "finalTotalLabel": "Total Akhir:",
                "manageRoom": "Atur Kamar",
                "roomStillOpen": "Kamar masih rame! Hayu lebet sareng tambah pesenan",
                "closeRoom": "Tutup Kamar",
                "openRoom": "Buka Kamar"
            }
        },
        "activeRoom": {
            "errorTitle": "Kasalahan",
            "goBack": "Wangsul",
            "roomNotAvailableTitle": "Kamar Teu Sadia",
            "roomNotAvailableDescription": "{roomId} teu valid atanapi teu aktif",
            "thisRoom": "Kamar Ieu",
            "restaurantInfo": "{restaurant} via {platform}",
            "cartTitle": "Kranjang",
            "unknownUser": "Pamake Teu Diterangkeun",
            "each": "hiji",
            "noOrderItems": "Teu acan aya item pesenan.",
            "shareRoomTitle": "Bagikeun Kamar",
            "shareRoomDescription": "Pindai kode QR kanggo ngabagikeun kamar ieu.",
            "close": "Tutup",
            "errors": {
                "loginToJoin": "Anjeun kedah lebet kanggo gabung kamar ieu",
                "joinFailed": "Gagal gabung kamar. Cobian deui.",
                "participantRequired": "Anjeun kedah janten peserta kanggo nambah item",
                "addFailed": "Gagal nambah item pesenan. Cobian deui.",
                "notParticipant": "Anjeun sanes peserta di kamar ieu.",
                "editOwnItems": "Anjeun mung tiasa ngarobah item anjeun nyalira",
                "loginToUpdate": "Anjeun kedah lebet kanggo nganyarkeun item",
                "updateFailed": "Gagal nganyarkeun item pesenan.",
                "loginToDelete": "Anjeun kedah lebet kanggo ngahapus item",
                "deleteOwnItems": "Anjeun mung tiasa ngahapus item anjeun nyalira",
                "deleteFailed": "Gagal ngahapus item pesenan.",
                "invalidUuid": "Format ID kamar teu valid.",
                "loadDetailsFailed": "Gagal ngamuat rincian kamar.",
                "roomNotFound": "Kamar teu kapendak.",
                "roomClosed": "Kamar ieu ditutup.",
                "loadParticipantsFailed": "Gagal ngamuat peserta.",
                "loadItemsFailed": "Gagal ngamuat item pesenan.",
                "checkParticipationFailed": "Gagal mariksa status partisipasi.",
                "loadDataFailed": "Gagal ngamuat data kamar.",
                "generateQrFailed": "Gagal ngahasilkeun kode QR."
            },
            "toast": {
                "deleteConfirm": "Hapus item pesenan ieu?",
                "delete": "Hapus",
                "cancel": "Batal"
            }
        },
        "histori": {
            "title": "Riwayat Kamar",
            "tabs": {
                "active": "Aktif",
                "closed": "Ditutup"
            },
            "emptyState": {
                "activeTitle": "Teu aya kamar aktif",
                "closedTitle": "Teu aya kamar ditutup",
                "activeDescription": "Anjeun teu acan gabung kamar aktif.",
                "closedDescription": "Anjeun teu acan gabung kamar nu parantos ditutup."
            }
        },
        "profile": {
            "index": {
                "memberSince": "Anggota ti",
                "lastSignIn": "Terakhir lebet",
                "provider": "Penyedia",
                "noUserInfo": "Teu aya informasi pamake",
                "changeUsername": "Gantos Nami Pamake",
                "managePaymentMethods": "Atur Metode Pamayaran",
                "changeLanguage": "Ganti Basa",
                "selectPreferredLanguage": "Pilih basa nu anjeun suka",
                "language": "Basa",
                "selectLanguage": "Pilih Basa",
                "save": "Simpen",
                "cancel": "Batal",
                "signingOut": "Kaluar...",
                "signOut": "Kaluar"
            },
            "mypayment": {
                "title": "Metode Pamayaran Abdi",
                "addPaymentMethod": "Tambah Metode Pamayaran",
                "noPaymentMethodsYet": "Teu acan aya metode pamayaran",
                "addPaymentMethodDescription": "Tambah metode pamayaran kanggo nampi artos ti peserta",
                "addedOn": "Ditambahkeun tanggal",
                "edit": "Ubah",
                "delete": "Hapus",
                "add": "Tambah",
                "paymentMethod": "Metode Pamayaran",
                "paymentType": "Tipe Pamayaran",
                "selectPaymentType": "Pilih tipe pamayaran",
                "bankTransfer": "Transfer Bank",
                "goPay": "GoPay",
                "ovo": "OVO",
                "dana": "Dana",
                "shopeePay": "ShopeePay",
                "bankName": "Nami Bank",
                "bankNamePlaceholder": "cth., BCA, BNI, Mandiri",
                "accountNumber": "Nomer Rekening",
                "accountNumberPlaceholder": "Lebetkeun nomer rekening",
                "cancel": "Batal",
                "update": "Perbarui",
                "save": "Simpen",
                "deletePaymentMethod": "Hapus Metode Pamayaran",
                "deleteConfirm": "Yakin bade ngahapus metode pamayaran ieu?",
                "errors": {
                    "saveFailed": "Gagal nyimpen metode pamayaran: {error}",
                    "deleteFailed": "Gagal ngahapus metode pamayaran: {error}"
                }
            }
        }
    }
};

export default su;