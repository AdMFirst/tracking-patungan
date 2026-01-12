/**
 * Instructions for AI machine:
 * Rule 1: prioritize the use $t in <template> and useI18n in <script setup>
 * Rule 2: Use the file path as prefix for i18n key (e.g., files in @/components/room/OrderRooms.vue is components.room.OrderRooms.whateverYouWantAfterwards)
 * Rule 3: Also use i18n on error messages and placeholder text
 * Rule 4: when the text is combined with date or currency, do it last then ask on how to proceed
 */
const en = {
    "components": {
        "auth": {
            "AuthForm": {
                "signInTitle": "Sign in to your account",
                "createAccountTitle": "Create your account",
                "noAccount": "Don't have an account?",
                "haveAccount": "Already have an account?",
                "signUp": "Sign up",
                "signIn": "Sign in",
                "orContinueWith": "Or continue with",
                "emailLabel": "Email",
                "passwordLabel": "Password",
                "hidePassword": "Hide password",
                "showPassword": "Show password",
                "fullNameLabel": "Full Name",
                "emailPlaceholder": "Enter your email",
                "passwordPlaceholder": "Enter your password",
                "fullNamePlaceholder": "Enter your full name",
                "loading": "Loading...",
                "signInButton": "Sign In",
                "signUpButton": "Sign Up",
                "genericError": "An error occurred. Please try again.",
                "discordLoginError": "Failed to initiate Discord login. Please try again.",
                "linkedInLoginError": "Failed to initiate LinkedIn login. Please try again."
            }
        },
        "common": {
            "BottomNav": {
                "home": "Home",
                "histori": "Histori",
                "create": "Create",
                "my room": "My Room",
                "profile": "Profile"
            },
            "LoadingScreen": {
                "0": "Delivering your dashboard...",
                "1": "Preparing your workspace...",
                "2": "Scanning your transactions...",
                "3": "Balancing the books securely...",
                "4": "Verifying payment details...",
                "5": "Tracking your funds flow...",
                "6": "Calculating your totals...",
                "7": "Securing your financial data...",
                "8": "Updating your balance...",
                "9": "Confirming recent payments...",
                "10": "Analyzing spending patterns...",
                "11": "Syncing bank connections...",
                "12": "Generating your reports...",
                "13": "Locking down your ledger...",
                "14": "Forecasting your cash flow...",
                "15": "Finalizing transaction history...",
            },
            "UserAvatar": {
                "connectedViaDiscord": "Connected via Discord",
                "connectedViaLinkedIn": "Connected via LinkedIn",
                "emailPassword": "Email/Password",
                "unknown": "Unknown"
            }
        },
        "qr": {
            "QRScanner": {
                "alignQRCode": "Align QR code within frame",
                "statusLabel": "Status",
                "activeStatus": "Active",
                "pausedStatus": "Paused",
                "startButton": "Start",
                "stopButton": "Stop"
            }
        },
        "room": {
            "JoinRoomPrompt": {
                "title": "You're not participating in this room",
                "description": "This room exists but you haven't joined it yet. Would you like to join and participate in the order?",
                "noButton": "No, go back",
                "yesButton": "Yes, join room",
                "joining": "Joining..."
            },
            "OrderRooms": {
                "untitledRoom": "Untitled Room",
                "unknown": "Unknown",
                "notSpecified": "Not specified",
                "roomStillOpen": "Room is still open!",
                "openRoomButton": "Open Room",
                "payNowButton": "Pay Now",
                "yourTotal": "Your total:",
                "runnerLabel": "Runner:",
                "restaurantLabel": "Restaurant:",
                "createdAtLabel": "Created at:",
                "itemsOrderedLabel": "Items Ordered:",
                "paidAt": "Paid at {date}",
                "paidAtVia": "Paid at {date} via {method}",
                "paymentConfirmed": "Payment confirmed for {amount} using selected payment method. Room has been marked as paid.",
                "paymentFailed": "Failed to confirm payment: {error}"
            },
            "QRScanDialog": {
                "scanQRButton": "Scan QR",
                "title": "Join a room by scanning qr code",
                "closeButton": "Close"
            }
        },
        "modals": {
            "AddOrderItemModal": {
                "title": "Add New Order Item",
                "description": "Add a new item to your order for this room.",
                "itemNameLabel": "Item Name",
                "itemNamePlaceholder": "Enter item name",
                "quantityLabel": "Quantity",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "Unit Price",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "Notes (optional)",
                "notesPlaceholder": "Any special instructions",
                "cancelButton": "Cancel",
                "addItemButton": "Add Item"
            },
            "CloseRoomModal": {
                "title": "Close Room",
                "description": "Enter the final total for this room.",
                "finalTotalLabel": "Final Total",
                "finalTotalPlaceholder": "Enter final total...",
                "cancelButton": "Cancel",
                "deleteRoomButton": "Delete Room",
                "submitButton": "Submit",
                "deleteConfirmTitle": "Are you sure?",
                "deleteConfirmDescription": "This action cannot be undone. All room data will be permanently deleted.",
                "deleteCancelButton": "Cancel",
                "deleteConfirmButton": "Delete"
            },
            "EditOrderItemModal": {
                "title": "Edit Order Item",
                "description": "Edit this order item.",
                "itemNameLabel": "Item Name",
                "itemNamePlaceholder": "Enter item name",
                "quantityLabel": "Quantity",
                "quantityPlaceholder": "1",
                "unitPriceLabel": "Unit Price",
                "unitPricePlaceholder": "0.00",
                "notesLabel": "Notes (optional)",
                "notesPlaceholder": "Any special instructions",
                "cancelButton": "Cancel",
                "updateItemButton": "Update Item"
            },
            "FilterModal": {
                "title": "Filters",
                "description": "Adjust your room search criteria.",
                "searchLabel": "Search by title/name",
                "searchPlaceholder": "Search rooms...",
                "platformLabel": "Platform",
                "platformPlaceholder": "All Platforms",
                "restaurantLabel": "Restaurant (Specific)",
                "restaurantPlaceholder": "Filter by specific restaurant...",
                "dateFromLabel": "From Date",
                "dateToLabel": "To Date",
                "clearFiltersButton": "Clear Filters",
                "applyFiltersButton": "Apply Filters"
            },
            "PaymentModal": {
                "title": "Payment Method",
                "description": "Select your payment method and confirm payment",
                "availablePaymentMethods": "Available Payment Methods:",
                "loadingPaymentMethods": "Loading payment methods...",
                "noPaymentMethods": "No payment methods found for this runner.",
                "confirmPaymentCheckbox": "I confirm that I have already paid for this order using the selected payment method",
                "cancelButton": "Cancel",
                "confirmPaymentButton": "Confirm Payment"
            },
            "SettingsModal": {
                "title": "Settings",
                "description": "Update your profile settings.",
                "usernameLabel": "Username",
                "usernamePlaceholder": "Enter your username...",
                "cancelButton": "Cancel",
                "saveChangesButton": "Save Changes"
            }
        },
        "UserInfo": {
            "welcomeBack": "Welcome back!",
            "accountInfo": "Your account information",
            "connectedViaDiscord": "Connected via Discord",
            "connectedViaLinkedIn": "Connected via LinkedIn",
            "defaultUser": "User",
            "memberSince": "Member since",
            "lastSignIn": "Last sign in",
            "accountStatus": "Account status",
            "activeStatus": "Active",
            "provider": "Provider",
            "discord": "Discord",
            "linkedIn": "LinkedIn",
            "noUserInfo": "No user information available",
            "signingOut": "Signing out...",
            "signOut": "Sign Out"
        }
    }
};

export default en;