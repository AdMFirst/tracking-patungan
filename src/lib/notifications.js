import { toast } from 'vue-sonner';
import { fetchSystemNotifications } from './supabaseClient';


/**
 * Check and display system notifications
 *
 * @returns {Promise<void>}
 */
export default async function checkSystemNotifications() {
    const STORAGE_KEY = 'talangin_last_notif_check';
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = new Date();
    const nowISO = now.toISOString();

    if (!stored) {
        localStorage.setItem(STORAGE_KEY, nowISO);
        return;
    }

    const lastCheckDate = new Date(stored);
    const hoursSinceLastCheck = (now - lastCheckDate) / (1000 * 60 * 60);

    if (hoursSinceLastCheck < 6) {
        return;
    }

    try {
        const notifications = await fetchSystemNotifications(stored);

        if (notifications && notifications.length > 0) {
            notifications.forEach((n) => {
                const type = n.type?.toLowerCase();
                const title = n.tittle || 'Notification';
                const description = n.message;
                const toastOptions = {
                    description,
                    duration: 5000,
                };

                switch (type) {
                    case 'success':
                        toast.success(title, toastOptions);
                        break;
                    case 'warning':
                        toast.warning(title, toastOptions);
                        break;
                    case 'error':
                        toast.error(title, toastOptions);
                        break;
                    case 'info':
                        toast.info(title, toastOptions);
                        break;
                    default:
                        toast(title, toastOptions);
                        break;
                }
            });
        }

        localStorage.setItem(STORAGE_KEY, nowISO);
    } catch (err) {
        console.error('Error fetching system notifications:', err);
    }
}