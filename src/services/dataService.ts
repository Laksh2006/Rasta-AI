import { Complaint, NotificationItem, User, UserRole, IssueCategory, IssueSeverity } from '../types';
import { INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS } from '../data/initialComplaints';

const STORAGE_KEY_COMPLAINTS = 'raastaai_complaints_v1';
const STORAGE_KEY_NOTIFS = 'raastaai_notifications_v1';
const STORAGE_KEY_USER = 'raastaai_active_user_v1';

export const DEMO_USERS: Record<UserRole, User> = {
  citizen: {
    id: 'cit-001',
    name: 'Aditya Sharma',
    email: 'citizen@raastaai.demo',
    role: 'citizen',
    phone: '+91 98201 45890',
    badge: 'Civic Watcher Level 2'
  },
  admin: {
    id: 'admin-001',
    name: 'Rajesh Varma',
    email: 'admin@raastaai.demo',
    role: 'admin',
    department: 'Municipal Corporation (Roads & Infrastructure)',
    badge: 'Chief Road Engineer'
  }
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToDataChanges = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

// Initialize or get stored complaints
export const getComplaints = (): Complaint[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    const complaints: Complaint[] = JSON.parse(raw);
    let updated = false;
    const migrated = complaints.map(c => {
      const init = INITIAL_COMPLAINTS.find(i => i.id === c.id);
      let changed = false;
      let img = c.imageUrl;
      let repairImg = c.repairEvidenceImage;

      // Automatically migrate legacy or broken external unsplash URLs to verified local assets
      if (img && (img.includes('unsplash.com') || !img.startsWith('/images/'))) {
        if (init) {
          img = init.imageUrl;
          changed = true;
        } else if (!img.startsWith('data:')) {
          img = '/images/fallback.jpg';
          changed = true;
        }
      }

      if (repairImg && (repairImg.includes('unsplash.com') || !repairImg.startsWith('/images/'))) {
        if (init?.repairEvidenceImage) {
          repairImg = init.repairEvidenceImage;
          changed = true;
        } else if (!repairImg.startsWith('data:')) {
          repairImg = '/images/repair-2.jpg';
          changed = true;
        }
      }

      if (changed) {
        updated = true;
        return { ...c, imageUrl: img, repairEvidenceImage: repairImg };
      }
      return c;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(migrated));
      return migrated;
    }
    return complaints;
  } catch (e) {
    console.error('Failed reading complaints from storage:', e);
    return INITIAL_COMPLAINTS;
  }
};

const saveComplaints = (complaints: Complaint[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    notifyListeners();
  } catch (e) {
    console.error('Failed saving complaints to storage:', e);
  }
};

export const getComplaintById = (id: string): Complaint | undefined => {
  const all = getComplaints();
  return all.find(c => c.id.trim().toLowerCase() === id.trim().toLowerCase());
};

// Notifications
export const getNotifications = (role?: UserRole): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    let list: NotificationItem[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (role) {
      list = list.filter(n => n.targetRole === role);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
};

const saveNotifications = (notifs: NotificationItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    notifyListeners();
  } catch (e) {
    console.error('Failed saving notifications:', e);
  }
};

export const addNotification = (item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
  const notifs = getNotifications();
  const newNotif: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: false,
    createdAt: new Date().toISOString()
  };
  saveNotifications([newNotif, ...notifs]);
};

export const markNotificationAsRead = (id: string) => {
  const notifs = getNotifications();
  const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(updated);
};

export const markAllNotificationsRead = (role: UserRole) => {
  const notifs = getNotifications();
  const updated = notifs.map(n => n.targetRole === role ? { ...n, read: true } : n);
  saveNotifications(updated);
};

// Generate formatted sequential complaint ID
export const generateNextComplaintId = (): string => {
  const complaints = getComplaints();
  const numbers = complaints.map(c => {
    const match = c.id.match(/RA-2026-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const max = numbers.length > 0 ? Math.max(...numbers, 0) : 0;
  const nextNum = max + 1;
  return `RA-2026-${String(nextNum).padStart(3, '0')}`;
};

// Create a new complaint
export interface CreateComplaintInput {
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  category: IssueCategory;
  description: string;
  severity: IssueSeverity;
  imageUrl: string;
  imageName?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    area: string;
    city: string;
    isDemo?: boolean;
  };
}

export const createComplaint = (input: CreateComplaintInput): Complaint => {
  const id = generateNextComplaintId();
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    ...input,
    id,
    status: 'Submitted',
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        status: 'Submitted',
        timestamp: now,
        actor: `Citizen (${input.citizenName})`,
        remarks: 'Complaint lodged with photograph and coordinates.'
      }
    ]
  };

  const list = [newComplaint, ...getComplaints()];
  saveComplaints(list);

  // Notifications
  addNotification({
    userId: input.citizenId,
    targetRole: 'citizen',
    complaintId: id,
    title: 'Complaint Registered',
    message: `Your report ${id} for "${input.category}" in ${input.location.area} was submitted successfully.`,
    type: 'success'
  });

  addNotification({
    userId: 'admin-001',
    targetRole: 'admin',
    complaintId: id,
    title: `New Report: ${id}`,
    message: `${input.citizenName} reported a ${input.severity.toLowerCase()} severity ${input.category.toLowerCase()} in ${input.location.area}.`,
    type: input.severity === 'High' ? 'alert' : 'info'
  });

  return newComplaint;
};

// Verification
export const verifyComplaint = (id: string, adminName: string = 'Rajesh Varma'): Complaint | null => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = complaints[index];

  const updated: Complaint = {
    ...current,
    status: 'Verified',
    verifiedAt: now,
    verifiedBy: adminName,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        status: 'Verified',
        timestamp: now,
        actor: `Municipal Admin (${adminName})`,
        remarks: 'Issue verified through civic inspection and geofence validation.'
      }
    ]
  };

  complaints[index] = updated;
  saveComplaints([...complaints]);

  addNotification({
    userId: updated.citizenId,
    targetRole: 'citizen',
    complaintId: updated.id,
    title: 'Complaint Verified',
    message: `Municipal authorities have verified your report ${updated.id}. It is now queued for team assignment.`,
    type: 'success'
  });

  return updated;
};

// Rejection
export const rejectComplaint = (id: string, reason: string, adminName: string = 'Rajesh Varma'): Complaint | null => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = complaints[index];

  const updated: Complaint = {
    ...current,
    status: 'Rejected',
    rejectionReason: reason,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        status: 'Rejected',
        timestamp: now,
        actor: `Municipal Admin (${adminName})`,
        remarks: `Rejected: ${reason}`
      }
    ]
  };

  complaints[index] = updated;
  saveComplaints([...complaints]);

  addNotification({
    userId: updated.citizenId,
    targetRole: 'citizen',
    complaintId: updated.id,
    title: 'Complaint Notice: Rejected',
    message: `Your report ${updated.id} could not be approved. Reason: ${reason}`,
    type: 'warning'
  });

  return updated;
};

// Assignment
export const assignComplaint = (
  id: string,
  team: string,
  priority: 'Standard' | 'Urgent' | 'Emergency' = 'Standard',
  remarks?: string,
  adminName: string = 'Rajesh Varma'
): Complaint | null => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = complaints[index];

  const updated: Complaint = {
    ...current,
    status: 'Assigned',
    assignedTeam: team,
    assignmentPriority: priority,
    assignmentRemarks: remarks || `Assigned to ${team} with ${priority.toLowerCase()} priority.`,
    assignedAt: now,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        status: 'Assigned',
        timestamp: now,
        actor: `Municipal Admin (${adminName})`,
        remarks: `Work order issued to ${team} (${priority} Priority). ${remarks ? 'Notes: ' + remarks : ''}`
      }
    ]
  };

  complaints[index] = updated;
  saveComplaints([...complaints]);

  addNotification({
    userId: updated.citizenId,
    targetRole: 'citizen',
    complaintId: updated.id,
    title: 'Maintenance Team Assigned',
    message: `Work order dispatched to "${team}" for your road issue ${updated.id}.`,
    type: 'info'
  });

  return updated;
};

// Mark In Progress
export const markComplaintInProgress = (id: string, actorName: string = 'Field Crew'): Complaint | null => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = complaints[index];

  const updated: Complaint = {
    ...current,
    status: 'In Progress',
    inProgressAt: now,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        status: 'In Progress',
        timestamp: now,
        actor: current.assignedTeam ? `${current.assignedTeam}` : actorName,
        remarks: 'Repair machinery deployed on-site. Excavation, leveling and resurfacing started.'
      }
    ]
  };

  complaints[index] = updated;
  saveComplaints([...complaints]);

  addNotification({
    userId: updated.citizenId,
    targetRole: 'citizen',
    complaintId: updated.id,
    title: 'Repair In Progress',
    message: `Field maintenance operations are actively underway for complaint ${updated.id}.`,
    type: 'info'
  });

  return updated;
};

// Resolution
export const resolveComplaint = (
  id: string,
  repairEvidenceImage: string,
  remarks: string,
  adminName: string = 'Rajesh Varma'
): Complaint | null => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = complaints[index];

  const updated: Complaint = {
    ...current,
    status: 'Resolved',
    resolvedAt: now,
    resolvedBy: adminName,
    repairEvidenceImage,
    resolutionRemarks: remarks,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        status: 'Resolved',
        timestamp: now,
        actor: `Municipal Admin (${adminName})`,
        remarks: remarks || 'Road surface successfully repaired and quality checked.',
        evidenceImage: repairEvidenceImage
      }
    ]
  };

  complaints[index] = updated;
  saveComplaints([...complaints]);

  addNotification({
    userId: updated.citizenId,
    targetRole: 'citizen',
    complaintId: updated.id,
    title: 'Issue Resolved 🎉',
    message: `Great news! The road issue reported in ${updated.id} has been repaired and verified.`,
    type: 'success'
  });

  return updated;
};

// Active user auth session management (stored in localStorage)
export const getActiveUser = (): User => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return DEMO_USERS.citizen;
};

export const setActiveUser = (user: User) => {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    notifyListeners();
  } catch (e) {
    console.error('Failed saving active user:', e);
  }
};

// Reset to initial demo state
export const resetDemoData = () => {
  localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
  notifyListeners();
};
