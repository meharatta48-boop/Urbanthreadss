import ActivityLog from "../models/activityLog.model.js";

export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(200); // return latest 200 logs
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch activity logs" });
  }
};

export const clearActivityLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.status(200).json({ success: true, message: "Activity logs cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to clear logs" });
  }
};
