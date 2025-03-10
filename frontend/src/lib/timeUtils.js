// timeUtils.js
export const formatLastOnline = (lastOnline) => {
    if (!lastOnline) return "";
  
    const now = new Date();
    const lastOnlineDate = new Date(lastOnline);
    const timeString = lastOnlineDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  
    // Calculate the difference in milliseconds
    const diffMs = now - lastOnlineDate;
    const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours
  
    // Get the date components for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastOnlineDay = new Date(
      lastOnlineDate.getFullYear(),
      lastOnlineDate.getMonth(),
      lastOnlineDate.getDate()
    );
    const diffDays = (today - lastOnlineDay) / (1000 * 60 * 60 * 24); // Difference in days
  
    if (diffDays < 1) {
      // Less than 24 hours (same day)
      return `Last seen today at ${timeString}`;
    } else if (diffDays < 2) {
      // Between 24 and 48 hours (yesterday)
      return `Last seen yesterday at ${timeString}`;
    } else {
      // More than 48 hours
      const dateString = lastOnlineDate.toLocaleDateString([], {
        day: "numeric",
        month: "short",
      });
      return `Last seen ${dateString} at ${timeString}`;
    }
  };