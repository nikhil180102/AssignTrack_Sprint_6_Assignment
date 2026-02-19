import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { notificationApi } from "../../api/notification.api";
import { getUserId } from "../../utils/auth";

const NotificationBell = () => {
  const { user } = useSelector((state) => state.auth);
  const role = (user?.role || "STUDENT").toUpperCase();
  const userId = user?.id || user?.userId || getUserId() || null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await notificationApi.getNotifications(role, userId);
        setItems(res.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, role, userId]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
    }
  };

  const handleDeleteOne = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteOne(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch {
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;
    try {
      await notificationApi.clearAll(userId);
      setItems([]);
    } catch {
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        title="Notifications"
        aria-expanded={open}
        aria-controls="notification-panel"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            id="notification-panel"
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
              ) : items.length ? (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer ${
                      n.isRead ? "bg-white dark:bg-gray-800" : "bg-indigo-50 dark:bg-indigo-900/30"
                    }`}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{n.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(e, n.id)}
                        className="text-xs text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
                        aria-label={`Remove notification ${n.title || ''}`}
                        title="Remove notification"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  No notifications.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
